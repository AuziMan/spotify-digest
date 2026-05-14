# Shared functions

# Formats an array of tracks, and returns the track, artist, and trackimg
import datetime
import json
import concurrent.futures
import urllib.parse
from flask import jsonify, session
import requests
from server.spotify.utils.auth import get_spotify_token



BASE_SPOTIFY_URL = "https://api.spotify.com/v1/me"
SPOTIFY_URL_USER_SEARCH = "https://api.spotify.com/v1"

_PITCH_CLASS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
_MODES = ['min', 'maj']

def _format_key(key_int, mode_int):
    if key_int is None or key_int == -1:
        return None
    return f"{_PITCH_CLASS[key_int]} {_MODES[int(mode_int)]}"

def fetch_audio_features(tracks, access_token):
    """
    Fetch audio features. Tries Spotify → ReccoBeats → Deezer.
    tracks: list of dicts with 'id' (and optionally 'track', 'artist' for Deezer fallback)
    Returns: {track_id: {bpm, key}}
    """
    if not tracks:
        return {}

    track_ids = [t['id'] for t in tracks if t.get('id')]
    if not track_ids:
        return {}

    result = _try_spotify_audio_features(track_ids, access_token)
    if result:
        return result

    result = _try_reccobeats_audio_features(track_ids)
    if result:
        return result

    # Deezer needs track name + artist for search
    searchable = [t for t in tracks if t.get('id') and t.get('track') and t.get('artist')]
    if searchable:
        return _fetch_bpm_deezer(searchable)

    return {}


def _try_spotify_audio_features(track_ids, access_token):
    try:
        ids_str = ','.join(track_ids[:100])
        resp = requests.get(
            f"{SPOTIFY_URL_USER_SEARCH}/audio-features?ids={ids_str}",
            headers={'Authorization': f"Bearer {access_token}"}
        )
        print(f"[audio-features] Spotify status={resp.status_code}")
        if resp.status_code == 200:
            result = {}
            for feat in resp.json().get('audio_features', []):
                if feat and feat.get('id'):
                    tempo = feat.get('tempo')
                    result[feat['id']] = {
                        'bpm': round(tempo) if tempo is not None else None,
                        'key': _format_key(feat.get('key'), feat.get('mode', 0)),
                    }
            print(f"[audio-features] Spotify resolved {len(result)} tracks")
            return result or None
        else:
            print(f"[audio-features] Spotify {resp.status_code} — trying ReccoBeats")
    except Exception as e:
        print(f"[audio-features] Spotify exception: {e}")
    return None


def _try_reccobeats_audio_features(track_ids):
    try:
        ids_str = ','.join(track_ids[:100])
        resp = requests.get(
            f"{RECCOBEATS_BASE}/audio-features?ids={ids_str}",
            headers={'Accept': 'application/json'},
            timeout=10
        )
        print(f"[audio-features] ReccoBeats status={resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            features = data.get('audio_features', data if isinstance(data, list) else [])
            result = {}
            for feat in features:
                if feat and feat.get('id'):
                    tempo = feat.get('tempo')
                    result[feat['id']] = {
                        'bpm': round(tempo) if tempo is not None else None,
                        'key': _format_key(feat.get('key'), feat.get('mode', 0)),
                    }
            print(f"[audio-features] ReccoBeats resolved {len(result)} tracks")
            return result or None
        else:
            print(f"[audio-features] ReccoBeats {resp.status_code} — trying Deezer")
    except Exception as e:
        print(f"[audio-features] ReccoBeats exception: {e}")
    return None


def _fetch_bpm_deezer_one(track):
    """Search Deezer for a track and return (track_id, bpm). No auth needed."""
    try:
        q = urllib.parse.quote(f"{track.get('track', '')} {track.get('artist', '')}")
        search = requests.get(
            f"https://api.deezer.com/search?q={q}&limit=1",
            timeout=8
        )
        if search.status_code == 200:
            hits = search.json().get('data', [])
            if hits:
                detail = requests.get(
                    f"https://api.deezer.com/track/{hits[0]['id']}",
                    timeout=8
                )
                if detail.status_code == 200:
                    bpm = detail.json().get('bpm', 0)
                    if bpm and bpm > 0:
                        return (track['id'], round(bpm))
    except Exception as e:
        print(f"[deezer] exception for {track.get('id')}: {e}")
    return (track['id'], None)


def _fetch_bpm_deezer(tracks):
    """Fetch BPM from Deezer in parallel. Returns {track_id: {bpm, key}}."""
    result = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(_fetch_bpm_deezer_one, t): t for t in tracks}
        for future in concurrent.futures.as_completed(futures, timeout=30):
            try:
                track_id, bpm = future.result()
                if bpm is not None:
                    result[track_id] = {'bpm': bpm, 'key': None}
            except Exception as e:
                print(f"[deezer] future error: {e}")
    print(f"[deezer] resolved BPM for {len(result)}/{len(tracks)} tracks")
    return result


def fetch_artist_genres(artist_ids, access_token):
    """Batch-fetch Spotify artist genres. Returns {artist_id: [genres]}."""
    if not artist_ids:
        return {}
    result = {}
    unique_ids = list(dict.fromkeys(artist_ids))  # preserve order, dedupe
    for i in range(0, len(unique_ids), 50):
        batch = unique_ids[i:i + 50]
        try:
            resp = requests.get(
                f"{SPOTIFY_URL_USER_SEARCH}/artists?ids={','.join(batch)}",
                headers={'Authorization': f"Bearer {access_token}"}
            )
            if resp.status_code == 200:
                for artist in resp.json().get('artists', []):
                    if artist and artist.get('id'):
                        result[artist['id']] = artist.get('genres', [])
            else:
                print(f"[artist-genres] error {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[artist-genres] exception: {e}")
    print(f"[artist-genres] resolved genres for {len(result)} artists")
    return result

RECCOBEATS_BASE = "https://api.reccobeats.com/v1"

SPOTIFY_TOP_TRACKS_ENDPOINT = f"{BASE_SPOTIFY_URL}/top/tracks"
 

def format_response_array(data):
    track_info = [
        {
            "track": track["name"],
            "artist": track["artists"][0]["name"] if track["artists"] else "Unknown Artist",
            "albumImg": track["album"]["images"][0]["url"] if track["album"]["images"] else "unknown image",
            "id": track["id"]
        }
        for track in data.get("items", [])
    ]
    return track_info

# Queue formatting
def format_queue_response(data):
    queue_info = [
        {
            "track": track["name"],
            "artist": track["artists"][0]["name"] if track["artists"] else "Unknown Artist",
            "albumImg": track["album"]["images"][0]["url"] if track["album"]["images"] else "unknown image",
            "id": track["id"]
        }
        for track in data.get("queue", [])
    ]
    return queue_info


def format_track_search(data):
    track_info = [
        {
            "track": track["name"],
            "artist": track["artists"][0]["name"] if track["artists"] else "Unknown Artist",
            "albumImg": track["album"]["images"][0]["url"] if track["album"]["images"] else "unknown image",
            "id": track["id"]
        }
        for track in data.get("tracks", [])
    ]
    return track_info

# Formats an object of track, and returns the track and artist

def format_response_obj(data):
    track_info = [
        {
            "track": data["item"]["name"],
            "artist": data["item"]["artists"][0]["name"] if data["item"]["artists"] else "Unknown Artist",
            "albumImg": data["item"]["album"]["images"][0]["url"] if data["item"]["album"]["images"] else "unknown image"
        }
    ]
    return track_info


def format_playlist_tracks(tracks_data):
    playlist_info = [
        {
            "track": track["track"]["name"],
            "artist": track["track"]["artists"][0]["name"] if track["track"]["artists"] else "Unknown Artist",
            "albumImg": track["track"]["album"]["images"][0]["url"] if track["track"]["album"]["images"] else "unknown image",
            "id": track["track"]["id"]
        }
        for track in tracks_data.get("items", [])
    ]

    return playlist_info

def get_playback_info(playback_data):
    device = playback_data.get("device", {})
    
    playback_info = {
        "device_id": device.get("id"),
        "device_name": device.get("name"),
        "is_active": device.get("is_active", False),
        "is_restricted": device.get("is_restricted", False),
        "is_playing": playback_data.get("is_playing", False),
        "track": None,
        "track_id": None,
        "artist": None,
        "albumImg": None
    }

    # Optionally add track info if available
    item = playback_data.get("item")
    if item:
        playback_info["track"] = item.get("name")
        playback_info["track_id"] = item.get("id")
        playback_info["artist"] = ", ".join([a["name"] for a in item.get("artists", [])])
        playback_info["albumImg"] = item.get("album", {}).get("images", [{}])[0].get("url")

    return playback_info


# def format_response_array(data):
#     print(data["items"][:1])
#     track_info = [
#         {
#             "track": track["name"],
#             "artist": track["artists"][0]["name"] if track["artists"] else "Unknown Artist",
#             "albumImg": track["album"]["images"][0]["url"] if track["album"]["images"] else "unknown image",
#             "id": track["id"]
#         }
#         for track in data.get("items", [])
#     ]
#     return track_info


def get_user_info_from_spotify():
    """ Helper function to fetch user info from Spotify. """
    try:
        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        response = requests.get(BASE_SPOTIFY_URL, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Spotify /me returned {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"get_user_info_from_spotify error: {e}")
        return None
    


def format_user_recc_seeds():
    try:
        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        response = requests.get(SPOTIFY_TOP_TRACKS_ENDPOINT, headers=headers)

        if response.status_code == 200:
            data = response.json()
            # Print the first 5 objects to inspect structure
            if isinstance(data, dict) and "items" in data:
                top_tracks = data["items"][:4]  

                track_ids = [track["id"] for track in top_tracks]
                # print(track_ids)

                return {"seed_tracks": track_ids}
            else:
                return jsonify({"error": "failed to fetch seed data"}), 500
        else:
            return jsonify({"error": "failed to fetch top tracks for seed data"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def search_tracks_by_id(seeds):
    try:
        print("in search by id")
        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        if seeds:
            request = f"{SPOTIFY_URL_USER_SEARCH}/tracks?ids={seeds}"
            print(request)

            response = requests.get(request, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print("Reccomended Tracks Found")
                return data
            else:
                return jsonify({"error": f"Failed to fetch top tracks: {response.status_code}"}), response.status_code
        else:
            return jsonify({"error": "Invalid seed data"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def request_to_curl(method, url, headers=None, params=None, json_body=None):
    curl = f"curl -X {method.upper()} \\\n  '{url}"
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        curl += f"?{query}"
    curl += "' \\\n"

    if headers:
        for k, v in headers.items():
            curl += f"  -H '{k}: {v}' \\\n"

    if json_body:
        curl += f"  -d '{json.dumps(json_body)}'"

    return curl
    
