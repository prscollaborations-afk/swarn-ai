import time
from fastapi import Request, HTTPException, status
from collections import defaultdict

# Simple in-memory sliding window rate limiter
# Key: client IP / shop ID -> list of request timestamps
_REQUEST_HISTORY = defaultdict(list)
MAX_REQUESTS_PER_MINUTE = 30

def check_rate_limit(request: Request):
    """Rate limit incoming requests to protect API endpoints and reduce latency."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window = now - 60.0

    # Clean old requests
    timestamps = [ts for ts in _REQUEST_HISTORY[client_ip] if ts > window]
    if len(timestamps) >= MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: max {MAX_REQUESTS_PER_MINUTE} requests per minute. Please try again shortly."
        )

    timestamps.append(now)
    _REQUEST_HISTORY[client_ip] = timestamps
