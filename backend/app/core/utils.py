from datetime import datetime, timezone

def get_utc_now():
    """
    Returns the current UTC datetime with timezone information.
    This should be used instead of datetime.now() when working with timezone-aware database fields.
    """
    return datetime.now(timezone.utc)
