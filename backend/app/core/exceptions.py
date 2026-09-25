class PersonalGPTException(Exception):
    """Base exception for all PersonalGPT domain errors."""
    def __init__(self, message: str, status_code: int = 400, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class NotFoundException(PersonalGPTException):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(f"{resource} with id '{resource_id}' not found.", status_code=404)

class LLMProviderException(PersonalGPTException):
    def __init__(self, message: str, provider: str = "unknown"):
        super().__init__(f"LLM Provider [{provider}] error: {message}", status_code=502)

class DocumentProcessingException(PersonalGPTException):
    def __init__(self, filename: str, reason: str):
        super().__init__(f"Failed to process document '{filename}': {reason}", status_code=422)

class SecurityException(PersonalGPTException):
    def __init__(self, message: str):
        super().__init__(f"Security violation: {message}", status_code=403)
