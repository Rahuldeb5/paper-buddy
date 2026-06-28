import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile

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
