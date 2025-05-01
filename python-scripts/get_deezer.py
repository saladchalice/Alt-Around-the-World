import time
import requests
import pandas as pd
from rapidfuzz import fuzz
import json
import re
import os
import string
import pykakasi

# Load data
lnos = pd.read_csv("../public/data/lnos.csv")
minidata = lnos[:]

# Initialize kakasi converter
kks = pykakasi.kakasi()
kks.setMode("H", "a")  # Hiragana to ascii
kks.setMode("K", "a")  # Katakana to ascii
kks.setMode("J", "a")  # Japanese to ascii
kks.setMode("r", "Hepburn")  # Romanization style
conv = kks.getConverter()

# Utility
def remove_punctuation(input_string):
    no_punc = re.sub(r'[^\w\s]', '', input_string)
    return re.sub(r'\s+', ' ', no_punc).strip()

def romanize(text):
    return conv.do(remove_punctuation(str(text))).lower().strip()

album_urls = []
track_ids = []
all_data = []
responses = []

for i in range(len(minidata)):
    if (i + 1) % 49 == 0:
        time.sleep(5)

    # Romanize and construct search term
    raw_song = minidata.iloc[i]['song name']
    raw_artist = minidata.iloc[i]['artist']
    
    song_roman = romanize(raw_song)
    artist_roman = romanize(raw_artist)
    term = '+'.join(song_roman.split()) + '+' + '+'.join(artist_roman.split())
    
    print(f"Searching: {term}")

    # Make API request
    url = f'https://api.deezer.com/search?q={term}&limit=5'
    response = requests.get(url)
    print(response)

    album_url = None
    track_id = None

    if response.status_code == 200:
        response_json = response.json()
        responses.append(response_json)
        candidates = response_json.get('data', [])

        best_score = 0
        best_item = None

        # Romanize target for comparison
        target_song = song_roman
        target_artist = artist_roman

        for item in candidates:
            song_match = romanize(item['title'])
            artist_match = romanize(item['artist']['name'])
            song_score = fuzz.partial_ratio(target_song, song_match)
            artist_score = fuzz.partial_ratio(target_artist, artist_match)
            total_score = (song_score + artist_score) / 2

            if total_score > best_score:
                best_score = total_score
                best_item = item

        if best_score > 80 and best_item is not None:
            album_url = best_item['album']['cover_medium']
            track_id = best_item['id']
    else:
        responses.append('No Results')

    album_urls.append(album_url)
    track_ids.append(track_id)

# Save results
new_lnos = lnos.copy()
new_lnos['album_url'] = pd.Series(album_urls)
new_lnos['track_id'] = pd.Series(track_ids, dtype="string")

output_path = '../public/data/lnos2.csv'
new_lnos.to_csv(output_path, index=False)
print(f'Data saved to {output_path}')

with open('../public/data/deezer_responses.json', 'w', encoding='utf-8') as f:
    json.dump(responses, f, indent=2, ensure_ascii=False)
