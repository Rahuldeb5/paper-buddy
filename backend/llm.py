import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

MODEL = "gemini-3.5-flash"
MAX_TEXT_CHARS = 500_000

_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "key_terms": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "term":             {"type": "string"},
                    "full_name":        {"type": "string"},
                    "definition":       {"type": "string"},
                    "defined_by_paper": {"type": "boolean"},
                },
                "required": ["term", "full_name", "definition", "defined_by_paper"],
            },
        },
        "key_ideas": {
            "type": "object",
            "properties": {
                "problem":       {"type": "string"},
                "core_insight":  {"type": "string"},
                "methodology":   {"type": "string"},
            },
            "required": ["problem", "core_insight", "methodology"],
        },
        "references": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title":          {"type": "string"},
                    "why_it_matters": {"type": "string"},
                },
                "required": ["title", "why_it_matters"],
            },
        },
        "section_importance": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "section":    {"type": "string"},
                    "importance": {"type": "string", "enum": ["high", "medium", "low"]},
                    "reason":     {"type": "string"},
                },
                "required": ["section", "importance", "reason"],
            },
        },
    },
    "required": ["key_terms", "key_ideas", "references", "section_importance"],
}


def load_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
    return genai.Client(api_key=api_key)


def analyze_paper(text: str) -> dict:
    truncated = text[:MAX_TEXT_CHARS]

    prompt = (
        "You are a research assistant helping a reader understand an academic paper. "
        "Analyze the paper text below and extract structured information about it.\n\n"
        "For key_terms: include acronyms, domain jargon, and named methods. "
        "Set defined_by_paper to true only if the paper itself defines the term.\n"
        "For references: include only the most important cited works and explain "
        "why each one matters to this paper's argument.\n\n"
        f"PAPER TEXT:\n{truncated}"
    )

    client = load_client()

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_ANALYSIS_SCHEMA,
        ),
    )

    return response.parsed


def chat_with_paper(text: str, question: str) -> str:
    truncated = text[:MAX_TEXT_CHARS]

    prompt = (
        "You are a research assistant helping a reader understand an academic paper. "
        "Answer the question below using only information from the paper. "
        "Be concise and specific — cite section names or quote short phrases when helpful.\n\n"
        f"PAPER TEXT:\n{truncated}\n\n"
        f"QUESTION: {question}"
    )

    client = load_client()

    response = client.models.generate_content(model=MODEL, contents=prompt)

    return response.text
