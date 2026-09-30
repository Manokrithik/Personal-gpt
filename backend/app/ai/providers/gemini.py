from typing import List, Dict, Any, AsyncIterator, Optional
import httpx
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.gemini")

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", default_model: str = "gemini-3.8-flash"):
        self.api_key = api_key
        self.default_model = default_model

    async def check_health(self) -> bool:
        return bool(self.api_key)

    async def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="personalgpt-pro",
                name="PersonalGPT Pro (Human Intelligence)",
                provider="gemini",
                is_local=False,
                context_length=2000000,
                description="PersonalGPT Pro: Elite human-like conversational intelligence, coding, and problem solving powered by Gemini 3.8 Flash"
            ),
            ModelInfo(
                id="gemini-3.8-flash",
                name="gemini-3.8-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 3.8 Flash (Latest state-of-the-art flagship model)"
            ),
            ModelInfo(
                id="gemini-flash-latest",
                name="gemini-flash-latest",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini Flash Latest"
            ),
            ModelInfo(
                id="gemini-3.7-flash",
                name="gemini-3.7-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 3.7 Flash"
            ),
            ModelInfo(
                id="gemini-3.6-flash",
                name="gemini-3.6-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 3.6 Flash"
            ),
            ModelInfo(
                id="gemini-2.5-pro",
                name="gemini-2.5-pro",
                provider="gemini",
                is_local=False,
                context_length=2000000,
                description="Google Gemini 2.5 Pro (Complex reasoning)"
            ),
        ]

    def _prepare_payload(self, messages: List[Dict[str, str]], image_data: Optional[str] = None, image_mime_type: Optional[str] = "image/jpeg", temperature: float = 0.7) -> Dict[str, Any]:
        system_text = ""
        raw_turns = []
        for i, msg in enumerate(messages):
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                if content:
                    system_text += content + "\n\n"
                continue

            gemini_role = "user" if role == "user" else "model"
            parts = []

            # If image_data is provided on the last user turn
            if i == len(messages) - 1 and image_data and gemini_role == "user":
                clean_b64 = image_data
                if "," in image_data:
                    clean_b64 = image_data.split(",", 1)[1]
                parts.append({
                    "inlineData": {
                        "mimeType": image_mime_type or "image/jpeg",
                        "data": clean_b64
                    }
                })

            if content:
                parts.append({"text": content})
            elif not parts:
                parts.append({"text": "Hello"})

            raw_turns.append({"role": gemini_role, "parts": parts})

        # Ensure alternating user/model turns by merging consecutive identical roles
        merged_turns = []
        for turn in raw_turns:
            if merged_turns and merged_turns[-1]["role"] == turn["role"]:
                merged_turns[-1]["parts"].extend(turn["parts"])
            else:
                merged_turns.append(turn)

        payload: Dict[str, Any] = {
            "contents": merged_turns if merged_turns else [{"role": "user", "parts": [{"text": "Hello"}]}],
            "generationConfig": {
                "temperature": temperature,
            }
        }
        if system_text.strip():
            payload["systemInstruction"] = {
                "parts": [{"text": system_text.strip()}]
            }
        return payload

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        is_valid_google_key = bool(self.api_key and len(self.api_key.strip()) > 10)
        if not is_valid_google_key:
            from app.ai.providers.offline_engine import OfflineEngine
            return OfflineEngine.generate_response(messages)

        raw_model = kwargs.get("model") or self.default_model
        if not raw_model or not raw_model.lower().startswith("gemini") or "1.5" in raw_model or "2.5-flash" in raw_model:
            model = "gemini-3.8-flash"
        else:
            model = raw_model

        # Priority sequence: latest flagship first
        candidates_to_try = list(dict.fromkeys([
            model,
            "gemini-3.8-flash",
            "gemini-flash-latest",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite"
        ]))

        image_data = kwargs.get("image_data")
        image_mime_type = kwargs.get("image_mime_type") or "image/jpeg"
        payload = self._prepare_payload(
            messages,
            image_data=image_data,
            image_mime_type=image_mime_type,
            temperature=kwargs.get("temperature", 0.7)
        )

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                for candidate_model in candidates_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate_model}:generateContent?key={self.api_key}"
                    try:
                        res = await client.post(url, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                if parts and "text" in parts[0]:
                                    return parts[0]["text"]
                        logger.warning(f"Gemini model {candidate_model} returned HTTP {res.status_code}: {res.text[:150]}")
                    except httpx.TimeoutException:
                        logger.warning(f"Gemini model {candidate_model} timed out. Trying next candidate...")
                    except Exception as req_err:
                        logger.warning(f"Error calling {candidate_model}: {req_err}")

                logger.warning("All Gemini candidate models failed. Falling back to OfflineEngine.")
                from app.ai.providers.offline_engine import OfflineEngine
                return OfflineEngine.generate_response(messages)

        except Exception as e:
            logger.warning(f"Gemini provider exception: {e}. Falling back to OfflineEngine.")
            from app.ai.providers.offline_engine import OfflineEngine
            return OfflineEngine.generate_response(messages)

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        is_valid_google_key = bool(self.api_key and len(self.api_key.strip()) > 10)
        if not is_valid_google_key:
            from app.ai.providers.offline_engine import OfflineEngine
            async for token in OfflineEngine.stream_response(messages):
                yield token
            return

        try:
            full_text = await self.generate(messages, **kwargs)
            words = full_text.split(" ")
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
        except Exception as e:
            logger.warning(f"Gemini stream error: {e}. Falling back to OfflineEngine stream.")
            from app.ai.providers.offline_engine import OfflineEngine
            async for token in OfflineEngine.stream_response(messages):
                yield token
