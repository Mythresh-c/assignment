"""
agents.py — Pure Python agent classes for the Educational Content Generator.
No LangChain or agent frameworks used.
"""

import json
import os
import httpx
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"


def _grade_language(grade: int) -> str:
    """Return language calibration instructions based on grade level."""
    if grade <= 3:
        return (
            "Use very simple words and short sentences suitable for young children "
            "(ages 6-8). Avoid jargon. Use relatable, everyday examples."
        )
    elif grade <= 6:
        return (
            "Use moderate vocabulary appropriate for middle-school students "
            "(ages 9-12). You may introduce subject-specific terms but always "
            "explain them simply."
        )
    else:
        return (
            "Use advanced vocabulary suitable for high-school students "
            "(ages 13-16). You may use technical terminology and more complex "
            "sentence structures."
        )


def _call_groq(messages: list[dict]) -> str:
    """
    Call the Groq chat completions API synchronously via httpx and return
    the assistant message content as a raw string.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise RuntimeError("Missing or invalid GROQ_API_KEY in .env file")
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048,
    }
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(GROQ_API_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        raise RuntimeError(
            f"Groq API returned status {e.response.status_code}: {e.response.text}"
        ) from e
    except Exception as e:
        raise RuntimeError(f"Groq API call failed: {str(e)}") from e


def _parse_json(raw: str) -> dict:
    """
    Safely parse JSON from Groq output.
    Strips markdown code fences if present.
    """
    text = raw.strip()
    # Remove ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        # find first newline after opening fence
        first_nl = text.index("\n")
        # find closing fence
        last_fence = text.rfind("```")
        if last_fence > first_nl:
            text = text[first_nl + 1 : last_fence].strip()
        else:
            text = text[first_nl + 1 :].strip()
    return json.loads(text)


# ─────────────────────────── GeneratorAgent ────────────────────────────────


class GeneratorAgent:
    """
    Generates educational content (explanation + 3 MCQs) for a given
    grade level and topic. Optionally incorporates reviewer feedback
    for refinement.
    """

    def run(self, grade: int, topic: str, feedback: list[str] | None = None) -> dict:
        lang = _grade_language(grade)
        feedback_block = ""
        if feedback:
            bullet_points = "\n".join(f"  - {fb}" for fb in feedback)
            feedback_block = (
                "\n\nIMPORTANT — A reviewer found issues with a previous draft. "
                "You MUST address every piece of feedback below:\n"
                f"{bullet_points}\n"
                "Revise the content so that none of these issues remain."
            )

        system_prompt = (
            "You are an expert educational content creator.\n"
            f"Target audience: Grade {grade} students.\n"
            f"Language guideline: {lang}\n\n"
            "You MUST respond with ONLY a valid JSON object — no extra text, "
            "no markdown, no explanation outside the JSON.\n"
            "The JSON schema is:\n"
            "{\n"
            '  "explanation": "<clear explanation of the topic>",\n'
            '  "mcqs": [\n'
            "    {\n"
            '      "question": "<question text>",\n'
            '      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],\n'
            '      "answer": "<correct letter, e.g. B>"\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "Generate EXACTLY 3 MCQs."
            f"{feedback_block}"
        )

        user_prompt = f"Create educational content about: {topic}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        raw = _call_groq(messages)
        return _parse_json(raw)


# ─────────────────────────── ReviewerAgent ─────────────────────────────────


class ReviewerAgent:
    """
    Reviews generated educational content for age appropriateness,
    conceptual correctness, and clarity.
    """

    def run(self, content: dict, grade: int) -> dict:
        system_prompt = (
            "You are a strict educational content reviewer.\n"
            f"The content was written for Grade {grade} students.\n\n"
            "Evaluate the content on these criteria:\n"
            "1. Age appropriateness — Is the language and complexity right for the grade?\n"
            "2. Conceptual correctness — Are all facts and MCQ answers correct?\n"
            "3. Clarity — Is the explanation clear and well-structured?\n\n"
            "You MUST respond with ONLY a valid JSON object — no extra text, "
            "no markdown, no explanation outside the JSON.\n"
            "The JSON schema is:\n"
            "{\n"
            '  "status": "pass" | "fail",\n'
            '  "feedback": ["issue 1 description", "issue 2 description"]\n'
            "}\n"
            'If everything is good, return status "pass" with an empty feedback array.\n'
            'If there are issues, return status "fail" with specific feedback items.'
        )

        user_prompt = (
            "Review the following educational content:\n\n"
            f"{json.dumps(content, indent=2)}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        raw = _call_groq(messages)
        return _parse_json(raw)
