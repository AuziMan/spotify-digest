import datetime
import concurrent.futures
from flask import Flask, jsonify, redirect, url_for, request, Blueprint, session
from dotenv import load_dotenv
import requests
import json
from server.spotify.utils.sharedFunctions import format_response_array, format_response_obj, format_playlist_tracks, get_user_info_from_spotify, fetch_audio_features, fetch_artist_genres
from server.spotify.utils.auth import get_spotify_token

SPOTIFY_URL_USER_SEARCH = "https://api.spotify.com/v1"

playlist_blueprint = Blueprint("playlist", __name__)

@playlist_blueprint.route('/playlists', methods=['GET'])
def get_user_playlists():
    print("in user playlists")
    try:

        access_token = get_spotify_token()
        # print(f'access token: {access_token}')

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        namesOnly = request.args.get('namesOnly', 'false').lower() == 'true'

        user_info = get_user_info_from_spotify()

        if not user_info:
            return jsonify({"error": "Failed to fetch user info"}), 500

        userId = user_info.get('id')
        if not userId:
            return jsonify({"error": "User ID not found in user info"}), 500
        
        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        endpoint = f"{SPOTIFY_URL_USER_SEARCH}/users/{userId}/playlists?limit=100"
        # print(endpoint)
        
        response = requests.get(endpoint, headers=headers)

        if response.status_code == 200:
            data = response.json()
            if namesOnly:
                album_names = [playlist["name"] for playlist in data.get("items", [])]
                return jsonify({"Your Public Albums": album_names})
            else:
                return jsonify(data)
        else:
            return jsonify({"error": f"Failed to fetch now playing: {response.status_code}"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@playlist_blueprint.route('/playlistTracks/<playlist_id>', methods=['GET'])
def get_user_playlist_songs(playlist_id):
    print("in user playlist songs")

    try:

        access_token = get_spotify_token()
        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401
        
        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        # playlist_id = request.args.get('playlistId')
        print(f'got playlist id: {playlist_id}')
        namesOnly = request.args.get('namesOnly', 'false').lower() == 'true'


        # Get Playlist Tracks
        tracks_endpoint = f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}/tracks?limit=100"
        tracks_response = requests.get(tracks_endpoint, headers=headers)
        print(tracks_response.json())

        # Get Playlist info (for the name)
        playlist_endpoint = f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}"
        playlist_response = requests.get(playlist_endpoint, headers=headers)

        if tracks_response.status_code == 200 and playlist_response.status_code == 200:
            
            print("here")
            tracks_data = tracks_response.json()
            playlist_data = playlist_response.json()
            print(playlist_data)
            # filtered_tracks_data = tracks_data["items"][:1]

            playlist_tracks = format_playlist_tracks(tracks_data)
            platlist_name =  playlist_data.get("name")

            audio_features = fetch_audio_features(playlist_tracks, access_token)
            for track in playlist_tracks:
                feat = audio_features.get(track.get('id'), {})
                track['bpm'] = feat.get('bpm')
                track['key'] = feat.get('key')

            formatted_response = {
                "playlistName": platlist_name,
                "playlistTracks": playlist_tracks
            }

            return jsonify(formatted_response)
        else:
            return jsonify({"error": "Failed to fetch playlist data"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@playlist_blueprint.route('/djGenres', methods=['GET'])
def get_dj_genres():
    """Fetch all user tracks across all playlists, deduplicated and grouped by genre."""
    try:
        access_token = get_spotify_token()
        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        headers = {'Authorization': f"Bearer {access_token}"}

        user_info = get_user_info_from_spotify()
        if not user_info:
            return jsonify({"error": "Failed to get user info"}), 500

        userId = user_info.get('id')
        playlists_resp = requests.get(
            f"{SPOTIFY_URL_USER_SEARCH}/users/{userId}/playlists?limit=50",
            headers=headers
        )
        if playlists_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch playlists"}), 400

        playlists = playlists_resp.json().get('items', [])
        print(f"[djGenres] fetching tracks for {len(playlists)} playlists")

        def fetch_playlist_items(playlist):
            try:
                resp = requests.get(
                    f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist['id']}/tracks?limit=100",
                    headers=headers,
                    timeout=10
                )
                if resp.status_code == 200:
                    return resp.json().get('items', [])
            except Exception as e:
                print(f"[djGenres] error fetching {playlist.get('id')}: {e}")
            return []

        all_items = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            for items in executor.map(fetch_playlist_items, playlists):
                all_items.extend(items)

        # Deduplicate tracks by ID
        seen = set()
        tracks = []
        for item in all_items:
            t = item.get('track')
            if not t or not t.get('id') or t['id'] in seen:
                continue
            seen.add(t['id'])
            artist_id = t['artists'][0]['id'] if t.get('artists') else None
            tracks.append({
                'id': t['id'],
                'track': t['name'],
                'artist': t['artists'][0]['name'] if t.get('artists') else 'Unknown',
                'artistId': artist_id,
                'albumImg': t['album']['images'][0]['url'] if t.get('album', {}).get('images') else None,
            })

        print(f"[djGenres] {len(tracks)} unique tracks")

        # Batch fetch artist genres
        artist_ids = list({t['artistId'] for t in tracks if t.get('artistId')})
        artist_genres_map = fetch_artist_genres(artist_ids, access_token)

        # Assign genre to each track
        for track in tracks:
            genres = artist_genres_map.get(track.get('artistId'), [])
            track['genre'] = genres[0].title() if genres else 'Other'

        # Group by genre, sort by count
        genre_map = {}
        for track in tracks:
            genre_map.setdefault(track['genre'], []).append(track)

        genres_sorted = sorted(genre_map.items(), key=lambda x: -len(x[1]))

        return jsonify({
            'totalTracks': len(tracks),
            'genres': [{'genre': g, 'count': len(t), 'tracks': t} for g, t in genres_sorted],
        })

    except Exception as e:
        print(f"get_dj_genres error: {e}")
        return jsonify({"error": str(e)}), 500


@playlist_blueprint.route('/djPlaylist/<playlist_id>', methods=['GET'])
def get_dj_playlist(playlist_id):
    try:
        access_token = get_spotify_token()
        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        headers = {'Authorization': f"Bearer {access_token}"}

        tracks_resp = requests.get(
            f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}/tracks?limit=100",
            headers=headers
        )
        playlist_resp = requests.get(
            f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}",
            headers=headers
        )

        if tracks_resp.status_code != 200 or playlist_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch playlist data"}), 400

        playlist_name = playlist_resp.json().get('name', 'Playlist')

        tracks = []
        for item in tracks_resp.json().get('items', []):
            t = item.get('track')
            if not t or not t.get('id'):
                continue
            artist_id = t['artists'][0]['id'] if t.get('artists') else None
            tracks.append({
                'id': t['id'],
                'track': t['name'],
                'artist': t['artists'][0]['name'] if t.get('artists') else 'Unknown',
                'artistId': artist_id,
                'albumImg': t['album']['images'][0]['url'] if t.get('album', {}).get('images') else None,
            })

        # Batch fetch artist genres and audio features
        artist_ids = [t['artistId'] for t in tracks if t.get('artistId')]
        artist_genres_map = fetch_artist_genres(artist_ids, access_token)

        audio_features = fetch_audio_features(tracks, access_token)

        # Merge into tracks
        for track in tracks:
            feat = audio_features.get(track['id'], {})
            track['bpm'] = feat.get('bpm')
            track['key'] = feat.get('key')
            genres = artist_genres_map.get(track.get('artistId'), [])
            # Use first genre as primary; fall back to 'Other'
            track['genre'] = genres[0].title() if genres else 'Other'
            track['allGenres'] = [g.title() for g in genres]

        # Group by primary genre
        genre_map = {}
        for track in tracks:
            genre_map.setdefault(track['genre'], []).append(track)

        genres_sorted = sorted(genre_map.items(), key=lambda x: -len(x[1]))

        return jsonify({
            'playlistName': playlist_name,
            'totalTracks': len(tracks),
            'genres': [{'genre': g, 'count': len(t), 'tracks': t} for g, t in genres_sorted],
        })

    except Exception as e:
        print(f"get_dj_playlist error: {e}")
        return jsonify({"error": str(e)}), 500


@playlist_blueprint.route('/createPlaylist', methods=['POST'])
def post_create_new_album():
    try:

        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Get the body of the request (expecting JSON with 'name')
        playlist_info = request.get_json()

        playlist_name = playlist_info.get('name')
        requestBody = {
            "name": playlist_name,
            "description": "New Playlist from spotify digest",
            "public": True
        }
        print(requestBody)
        if not requestBody or not requestBody.get('name'):
            return jsonify({"error": "Playlist name is required."}), 400

        user_info = get_user_info_from_spotify()

        if not user_info:
            return jsonify({"error": "Failed to fetch user info"}), 500

        userId = user_info.get('id')

        if not userId:
            return jsonify({"error": "User ID not found in user info"}), 500
        
        # Authorization header
        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        # Now that we have the userId, create the playlist
        endpoint = f"{SPOTIFY_URL_USER_SEARCH}/users/{userId}/playlists"
        print(f"Playlist creation endpoint: {endpoint}, headers {headers}")

        # Make the request to create the playlist
        response = requests.post(endpoint, headers=headers, json=requestBody)

        if response.status_code == 201:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Failed to create new playlist: {response.json()}"}), response.status_code

    except Exception as e:
        # General error handler
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@playlist_blueprint.route('/removePlaylist', methods=['POST'])
def delete_remove_playlist():
    try:

        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Get the body of the request (expecting JSON with 'name')
        data = request.get_json()
        playlist_id = data.get('playlist_id')

        print(f'got playlist id: {playlist_id}')

        
        # Authorization header
        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        endpoint = f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}/followers"
        print(f"Playlist delete endpoint: {endpoint}, headers {headers}")

        # Make the request to remove the playlist
        response = requests.delete(endpoint, headers=headers)

        if response.status_code == 200:
            return jsonify({"message": "Playlist successfully removed"}), 200
        else:
            return jsonify({"error": f"Failed to remove playlist: {response.json()}"}), response.status_code

    except Exception as e:
        # General error handler
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    


@playlist_blueprint.route('/addToPlaylist', methods=['POST'])
def post_add_to_playlist():
    try:

        access_token = get_spotify_token()

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Get the body of the request (expecting JSON with 'name')
        data = request.get_json()
        track_ids = data.get('uris')
        playlist_id = data.get('playlist_id')

        print(f'got song ids: {track_ids}')
        print(f'got playlistId: {playlist_id}')

        formatted_uris = [f"spotify:track:{track_id}" for track_id in track_ids]


        requestBody = {
            "uris": formatted_uris, #Already padded in an array
            "position": 0
        }

        print(requestBody)

        
        # Authorization header
        headers = {
            'Authorization': f"Bearer {access_token}"
        }

        endpoint = f"{SPOTIFY_URL_USER_SEARCH}/playlists/{playlist_id}/tracks"
        print(f" add track endpoint: {endpoint}, headers {headers}")

        # Make the request to remove the playlist
        response = requests.post(endpoint, headers=headers, json=requestBody)
        print(response)

        if response.status_code == 201:
            return jsonify({"message": "song successfully added"}), 201
        else:
            return jsonify({"error": f"Failed to add song to playlist: {response.json()}"}), response.status_code

    except Exception as e:
        # General error handler
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500