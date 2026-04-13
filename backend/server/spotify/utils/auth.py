import base64
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os
import requests
import urllib.parse
from flask import Flask, jsonify, request, Blueprint, redirect

load_dotenv()

auth_blueprint = Blueprint("auth", __name__)

SPOTIFY_CID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CS = os.getenv('SPOTIFY_CLIENT_SECRET')
LOCAL_BASE_URL = os.getenv('LOCAL_BASE_URL')
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL')
MOBILE_REDIRECT_URI = os.getenv('MOBILE_REDIRECT_URI') 
JWT_SECRET = os.getenv('JWT_SECRET') 

JWT_SECRET = JWT_SECRET
JWT_ALGORITHM = 'HS256'

def create_jwt_token(access_token, refresh_token, ):
    payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)  # Token expires in 1 hour
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

def get_spotify_token():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    parts = auth_header.split()

    if len(parts) != 2 or parts[0] != "Bearer":
        return None

    jwt_token = parts[1]

    try:
        payload = decode_jwt_token(jwt_token)
        return payload.get("access_token")
    except Exception as e:
        print("JWT decode failed:", e)
        return None


REDIRECT_URI = f"{LOCAL_BASE_URL}/auth/callback"

AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"


@auth_blueprint.route('/login')
def login():
    # print(session)
    scope = 'user-read-private user-read-email user-top-read user-modify-playback-state user-read-currently-playing playlist-modify-public playlist-modify-private user-read-playback-state'

    params = {
        'client_id': SPOTIFY_CID,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': REDIRECT_URI,
        'show_dialog': True
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    print(f"Generated Auth URL: {auth_url}")  # Print the URL for debugging
    # return jsonify({"spotify_oauth_url": auth_url})  # Return the URL as JSON
    return redirect(auth_url)  # Redirect the user to Spotify's authorization page


@auth_blueprint.route('/callback')
def callback():
    print("Processing OAuth callback")

    error = request.args.get('error')
    code = request.args.get('code')

    if error:
        return jsonify({"error": error}), 400

    if not code:
        return jsonify({"error": "Authorization code not found"}), 400

    try:
        print(f"Got authorization code: {code[:10]}...")

        # Exchange code for tokens
        req_body = {
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'client_id': SPOTIFY_CID,
            'client_secret': SPOTIFY_CS
        }

        response = requests.post(TOKEN_URL, data=req_body)
        response.raise_for_status()

        token_info = response.json()

        if 'access_token' not in token_info:
            return jsonify({"error": "Failed to retrieve access token"}), 400

        access_token = token_info['access_token']
        refresh_token = token_info.get('refresh_token')

        print("Token exchange successful")

        # ✅ CREATE JWT (this is the key change)
        jwt_token = create_jwt_token(access_token, refresh_token)

        print("JWT created, redirecting to frontend")

        # ✅ Redirect to React app with JWT
        return redirect(f"{FRONTEND_BASE_URL}/callback?token={jwt_token}")
    
    except requests.exceptions.RequestException as e:
        print(f"Error while exchanging token: {e}")
        return jsonify({"error": "Token exchange failed"}), 500


# @auth_blueprint.route('/refresh_token')
# def refresh_token():
#     if 'refresh_token' not in session:
#         return redirect('/login')
    
#     if datetime.now().timestamp() > session['expires_at']:
#         req_body = {
#             'grant_type': 'refresh_token',
#             'refresh_token': session['refresh_token'],
#             'client_id': SPOTIFY_CID,
#             'client_secret': SPOTIFY_CS
#         }

#         response = requests.post(TOKEN_URL, data=req_body)
#         new_token_info = response.json()

#         session['access_token'] = new_token_info['access_token']
#         session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in'] 

#         next_url = session.pop('next_url', '/user/topTracks')
#         return redirect(next_url)
