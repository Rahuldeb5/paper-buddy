import fitz


def extract_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    pages = []

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        pages.append(f"--- Page {page_num} ---\n{text}")

    doc.close()
    return "\n".join(pages)
