import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile

from extractor import extract_figures, extract_text

BASE_UPLOAD_DIR = Path("uploads")

app = FastAPI()


async def save_upload(file: UploadFile) -> tuple[str, Path]:
    session_id = str(uuid.uuid4())
    session_dir = BASE_UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = session_dir / "original.pdf"
    pdf_path.write_bytes(await file.read())

    return session_id, session_dir


@app.get("/")
def root():
    return {"message": "hello"}


@app.post("/upload")
async def upload_paper(file: UploadFile = File(...)):
    session_id, session_dir = await save_upload(file)

    pdf_path = str(session_dir / "original.pdf")

    text, page_count = extract_text(pdf_path)
    (session_dir / "text.txt").write_text(text)

    figure_paths = extract_figures(pdf_path, str(session_dir))

    return {
        "session_id": session_id,
        "pages": page_count,
        "figures_found": len(figure_paths),
        "text_preview": text[:300],
    }
