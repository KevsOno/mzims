import re

def is_valid_phone(phone: str) -> bool:
    # Simple Nigerian phone validation
    pattern = r'^(\+?234|0)[7-9][0-9]{9}$'
    return re.match(pattern, phone) is not None

def is_valid_email(email: str) -> bool:
    # Basic email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
