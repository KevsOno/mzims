import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None   # optional for future context

class ChatResponse(BaseModel):
    reply: str

# You can use OpenAI, Groq, or any LLM. We'll use OpenAI as example.
# Set OPENAI_API_KEY in environment variables.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    # Simple prompt engineering for fragrance advice
    system_prompt = (
        "You are a helpful assistant for Muzoscent, a luxury fragrance brand. "
        "Answer customer questions about perfumes, scents, recommendations, orders, and the brand. "
        "Be polite, concise, and informative. If you don't know, say so."
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",   # or "gpt-3.5-turbo"
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                "temperature": 0.7,
                "max_tokens": 250,
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="OpenAI API error")

        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        return ChatResponse(reply=reply)
