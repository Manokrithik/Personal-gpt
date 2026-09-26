import random
import urllib.parse
from typing import Dict, Any, Optional
from app.ai.tools.base import BaseTool
from app.core.logging import get_logger

logger = get_logger("tools.image_generation")

class ImageGenerationTool(BaseTool):
    name = "image_generation"
    description = (
        "Generate stunning, photorealistic, or artistic images based on user needs and descriptions. "
        "Returns a high-resolution direct image URL with width, height, and ready-to-render markdown."
    )
    parameters = {
        "prompt": {
            "type": "string",
            "description": "The detailed visual prompt describing the scene, style, lighting, and subjects to generate.",
            "required": True,
        },
        "aspect_ratio": {
            "type": "string",
            "description": "Aspect ratio: 'square' (1024x1024), 'wide' (1280x720), 'tall' (720x1280). Default is 'square'.",
            "required": False,
        }
    }

    async def execute(self, prompt: str = "", aspect_ratio: str = "square", **kwargs) -> Dict[str, Any]:
        clean_prompt = prompt.strip()
        if not clean_prompt:
            clean_prompt = "A breathtaking futuristic cybernetic cityscape with neon reflections and holographic art"

        # Determine dimensions
        width = 1024
        height = 1024
        if aspect_ratio == "wide" or "landscape" in aspect_ratio:
            width, height = 1280, 720
        elif aspect_ratio == "tall" or "portrait" in aspect_ratio:
            width, height = 720, 1280

        # Unique seed to ensure fresh, non-cached generation
        seed = random.randint(100000, 999999)
        encoded_prompt = urllib.parse.quote(clean_prompt)
        
        # Pollinations Flux AI Generation URL
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&seed={seed}"

        logger.info(f"Generated image for prompt: '{clean_prompt}' -> {image_url}")

        return {
            "status": "success",
            "prompt": clean_prompt,
            "image_url": image_url,
            "width": width,
            "height": height,
            "seed": seed,
            "markdown": f"![{clean_prompt}]({image_url})"
        }
