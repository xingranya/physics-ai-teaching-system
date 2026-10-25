#!/usr/bin/env python3
"""把 docs/交付/*.html 重新生成 .docx。

四步：图片内嵌 → HTML 转 Word → 补齐字体属性 → 一级标题段前分页。

为什么需要后两步：
1. 转换器只给部分字体属性（ascii / eastAsia）赋值，hAnsi 与 cs 留空。Word 通常
   能兜住，但 LibreOffice 这类渲染器会回退到不含中文字形的字体，整页中文变空白。
   统一把四个属性写成同一个字族，跨环境才稳。
2. 转换器不保留 CSS 的 page-break，每章会接在上一章后面。这里给一级标题加
   「段前分页」，让每章从新页开始。

用法：python3 docs/交付/build_docx.py
"""
import base64
import json
import os
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
DOCS = ["产品技术文档", "操作手册"]
CONVERT = os.environ.get(
    "DOCX_CONVERT",
    "/Users/xingranya/.workbuddy-ai/plugins/cache/workbuddy-builtin/"
    "workbuddy-docx/5.8.4-wb.41366630.g73952edb.hb7e8a97fb563/"
    "skills/html-to-doc/scripts/convert_doc.py",
)


def inline_images(html: str) -> str:
    """把 assets/*.png 换成 base64，转换器读不到 file:// 图片。"""

    def repl(match):
        data = (HERE / match.group(1)).read_bytes()
        return 'src="data:image/png;base64,%s"' % base64.b64encode(data).decode()

    return re.sub(r'src="(assets/[^"]+)"', repl, html)


def convert(html_path: pathlib.Path, docx_path: pathlib.Path) -> dict:
    out = subprocess.run(
        [sys.executable, CONVERT, "--html", str(html_path), "--output", str(docx_path), "--no-preflight"],
        capture_output=True,
        text=True,
    )
    line = [row for row in out.stdout.strip().splitlines() if row.startswith("{")]
    if out.returncode != 0 or not line:
        raise SystemExit(f"转换失败：{out.stdout[-400:]}{out.stderr[-400:]}")
    result = json.loads(line[-1])
    if not result.get("success"):
        raise SystemExit(f"转换失败：{result.get('error')}")
    return result


def normalize(path: pathlib.Path) -> int:
    from docx import Document
    from docx.oxml.ns import qn

    doc = Document(str(path))
    changed = 0

    def fix(paragraph):
        nonlocal changed
        for run in paragraph.runs:
            rpr = run._element.get_or_add_rPr()
            fonts = rpr.find(qn("w:rFonts"))
            if fonts is None:
                fonts = rpr.makeelement(qn("w:rFonts"), {})
                rpr.insert(0, fonts)
            family = fonts.get(qn("w:eastAsia")) or fonts.get(qn("w:ascii")) or "Songti SC"
            for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
                if fonts.get(qn(attr)) != family:
                    fonts.set(qn(attr), family)
                    changed += 1

    for paragraph in doc.paragraphs:
        fix(paragraph)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    fix(paragraph)
    doc.save(str(path))
    return changed


def page_break_h1(path: pathlib.Path) -> int:
    from docx import Document

    doc = Document(str(path))
    count = 0
    seen_first = False
    for paragraph in doc.paragraphs:
        style = paragraph.style.name if paragraph.style is not None else ""
        if style != "Heading 1":
            continue
        # 正文第一个一级标题紧跟分节符，再加段前分页会多出一张空白页
        if not seen_first:
            seen_first = True
            continue
        paragraph.paragraph_format.page_break_before = True
        count += 1
    doc.save(str(path))
    return count


def enable_field_update(path: pathlib.Path) -> bool:
    """让 Word 打开文档时重算域，主要是目录页码。

    转换器把目录写成了真正的 TOC 域，但缓存页码全是 1（它在转换时拿不到最终
    分页）。加 w:updateFields 后，Word 打开时会用真实字体重排并刷新页码。
    元素必须插在 w:compat 之前，否则不满足 CT_Settings 的顺序约束。
    """
    from docx import Document
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    doc = Document(str(path))
    settings = doc.settings.element
    if settings.find(qn("w:updateFields")) is not None:
        doc.save(str(path))
        return False

    element = OxmlElement("w:updateFields")
    element.set(qn("w:val"), "true")
    anchor = settings.find(qn("w:compat"))
    if anchor is not None:
        anchor.addprevious(element)
    else:
        settings.append(element)
    doc.save(str(path))
    return True


def main() -> None:
    for name in DOCS:
        html = (HERE / f"{name}.html").read_text(encoding="utf-8")
        temp = pathlib.Path(f"/tmp/{name}.b64.html")
        temp.write_text(inline_images(html), encoding="utf-8")

        docx = HERE / f"{name}.docx"
        result = convert(temp, docx)
        fonts = normalize(docx)
        heads = page_break_h1(docx)
        updated = enable_field_update(docx)

        verify = result.get("verify", {})
        print(
            f"{name}: {docx.stat().st_size // 1024} KB，"
            f"内容 {verify.get('content', {}).get('total')} 项 / "
            f"缺失 {verify.get('content', {}).get('missing_count')}，"
            f"字体补齐 {fonts} 处，分页 {heads} 处，"
            f"目录重算 {'已开启' if updated else '已存在'}"
        )


if __name__ == "__main__":
    main()
