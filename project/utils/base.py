def tryParseInt(val, default=None):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default
