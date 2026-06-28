import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

MODEL = "gemini-2.0-flash"
MAX_TEXT_CHARS = 500_000


def load_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
    return genai.Client(api_key=api_key)
