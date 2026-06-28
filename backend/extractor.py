import fitz
from pathlib import Path


def extract_text(pdf_path: str) -> tuple[str, int]:
    doc = fitz.open(pdf_path)
    page_count = len(doc)
    pages = []

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        pages.append(f"--- Page {page_num} ---\n{text}")

    doc.close()
    return "\n".join(pages), page_count


def extract_figures(pdf_path: str, output_dir: str) -> list[str]:
    figures_dir = Path(output_dir) / "figures"
    figures_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    saved_paths = []

    for page in doc:
        for xref, _, width, height, *_ in page.get_images():
            if width * height < 300_000:
                continue

            image_data = doc.extract_image(xref)
            image_bytes = image_data["image"]
            extension = image_data["ext"]

            filename = figures_dir / f"fig_{xref}.{extension}"
            filename.write_bytes(image_bytes)
            saved_paths.append(str(filename))

    doc.close()
    return saved_paths
