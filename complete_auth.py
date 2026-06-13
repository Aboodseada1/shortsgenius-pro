#!/usr/bin/env python3
"""Quick script to complete YouTube OAuth with provided code."""

import json
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

BASE_DIR = Path(__file__).parent.resolve()
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
]

credentials_file = BASE_DIR / "daddysjokes-client.json"
token_file = BASE_DIR / "youtube_token.json"

# The auth code from the user
auth_code = "4/1ASc3gC3XOvLhg-ahIofuqidM2UFgHmGZcbT8tk-FdEURymgX5nnEPJO80Ts"

print("🔐 Completing YouTube OAuth flow...")

flow = InstalledAppFlow.from_client_secrets_file(str(credentials_file), SCOPES)
flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"

try:
    flow.fetch_token(code=auth_code)
    creds = flow.credentials
    
    with open(token_file, "w") as token:
        token.write(creds.to_json())
    
    print("✅ Authentication complete! Token saved to youtube_token.json")
    print(f"📁 Token file: {token_file}")
except Exception as e:
    print(f"❌ Error: {e}")
