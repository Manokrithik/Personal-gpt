import random
import re
import urllib.parse
from typing import Dict, Any, Optional
from app.ai.tools.base import BaseTool
from app.core.logging import get_logger

logger = get_logger("tools.image_generation")

class ImageGenerationTool(BaseTool):
    name = "image_generation"
    description = (
        "Quick and highly accurate AI image generation based on user needs and descriptions. "
        "Produces clean, vibrant artwork, photos, 3D renders, and illustrations matching their exact request."
    )
    parameters = {
        "prompt": {
            "type": "string",
            "description": "The visual prompt describing the subject, scene, style, and lighting requested by the user.",
            "required": True,
        },
        "aspect_ratio": {
            "type": "string",
            "description": "Aspect ratio: 'square' (768x768), 'wide' (1024x576), 'tall' (576x1024). Default is 'square'.",
            "required": False,
        }
    }

    def _enhance_prompt_for_accuracy(self, raw_prompt: str) -> str:
        """Cleans and enriches user prompt to ensure accurate style, lighting, and fidelity."""
        clean = raw_prompt.strip()
        # Remove redundant instruction prefixes
        clean = re.sub(r'^(?:please\s+)?(?:generate|create|make|draw|paint|render|produce|design)\s+(?:an?\s+|the\s+)?(?:image|picture|photo|illustration|drawing|artwork|graphic|render|portrait|wallpaper)?(?:\s+(?:of|showing|depicting|with|for))?\s*', '', clean, flags=re.IGNORECASE)
        clean = clean.strip(" .?!,")

        if not clean:
            clean = "A breathtaking futuristic cybernetic cityscape with neon reflections and holographic art"

        lower = clean.lower()

        # Detect desired art style and enhance accordingly without overriding the subject
        enhancers = []

        if any(w in lower for w in ["realistic", "photoreal", "photo", "photograph", "real life", "portrait"]):
            enhancers.append("photorealistic 8k, natural studio lighting, highly detailed textures, sharp focus, 35mm photography")
        elif any(w in lower for w in ["cyberpunk", "sci-fi", "futuristic", "neon"]):
            enhancers.append("cinematic neon glow, highly detailed sci-fi aesthetics, volumetric lighting, 8k render")
        elif any(w in lower for w in ["anime", "manga", "ghibli", "makoto"]):
            enhancers.append("vibrant anime art style, crisp outlines, atmospheric lighting, high resolution studio illustration")
        elif any(w in lower for w in ["3d", "isometric", "render", "octane", "blender", "clay"]):
            enhancers.append("isometric 3D render, smooth ambient occlusion, clean studio lighting, octane render style")
        elif any(w in lower for w in ["vector", "minimal", "flat", "logo", "icon", "ui"]):
            enhancers.append("clean vector illustration, minimalist flat design, modern graphic art, vibrant colors")
        elif any(w in lower for w in ["oil painting", "canvas", "watercolor", "painted"]):
            enhancers.append("detailed painterly brushwork, textured canvas, expressive artistic lighting")
        else:
            # General aesthetic enhancer that preserves user prompt accurately
            enhancers.append("high quality, sharp focus, detailed composition, vibrant cinematic lighting")

        # Combine: User's exact prompt first (highest priority) + subtle enhancement
        enhanced = f"{clean}, {', '.join(enhancers)}"
        return enhanced

    async def execute(self, prompt: str = "", aspect_ratio: str = "square", **kwargs) -> Dict[str, Any]:
        raw_prompt = prompt.strip() or "Futuristic neon AI landscape"
        enhanced_prompt = self._enhance_prompt_for_accuracy(raw_prompt)

        # Optimal dimensions for fast generation (under 2 seconds) and sharp display
        width = 768
        height = 768
        ratio_lower = (aspect_ratio or "").lower()
        if "wide" in ratio_lower or "landscape" in ratio_lower:
            width, height = 1024, 576
        elif "tall" in ratio_lower or "portrait" in ratio_lower:
            width, height = 576, 1024

        # Random seed to guarantee fresh, non-stale generation
        seed = random.randint(100000, 999999)
        encoded_prompt = urllib.parse.quote(enhanced_prompt)

        # High-speed Pollinations generation endpoint
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&seed={seed}"

        logger.info(f"Fast & accurate image generated: '{raw_prompt}' -> {image_url}")

        return {
            "status": "success",
            "prompt": raw_prompt,
            "enhanced_prompt": enhanced_prompt,
            "image_url": image_url,
            "width": width,
            "height": height,
            "seed": seed,
            "markdown": f"![{raw_prompt}]({image_url})"
        }
