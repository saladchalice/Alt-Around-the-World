import time
import requests
import pandas as pd
from rapidfuzz import fuzz
import json
import re
import os
import string

# Example input: replace this with your own import
# e.g., from deezer_data_source import lnos
lnos = pd.read_csv("../public/data/lnos.csv")
minidata = lnos[:]

# Utility
def remove_punctuation(input_string):
    no_punc= re.sub(r'[^\w\s]', '', input_string)
    return re.sub(r'\s+', ' ', no_punc).strip()

album_urls = []
track_ids = []
all_data = []
responses = []


for i in range(len(minidata)):
    if (i + 1) % 49 == 0:
        time.sleep(5)

    # Create search term
    songName = '+'.join(remove_punctuation(minidata.iloc[i]['song name']).split())
    artistName = '+'.join(remove_punctuation(minidata.iloc[i]['artist']).split())
    term = songName + '+' + artistName
    print(term)

    # Make request to Deezer API (increase limit to allow better matching)
    url = f'https://api.deezer.com/search?q={term}&limit=5'
    response = requests.get(url)
    print(response)

    album_url = None
    preview_url = None
    track_id= None

    if response.status_code == 200:
        response_json = response.json()
        responses.append(response_json)
        candidates = response_json.get('data', [])
        
        best_score = 0
        best_item = None
        
        target_song = minidata.iloc[i]['song name'].lower().strip()
        target_artist = minidata.iloc[i]['artist'].lower().strip()

        for item in candidates:
            song_match = item['title'].lower().strip()
            artist_match = item['artist']['name'].lower().strip()
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


new_lnos = lnos.copy()
new_lnos['album_url']=pd.Series(album_urls)
new_lnos['track_id'] = pd.Series(track_ids, dtype="string")

# Save the DataFrame as CSV in the public/data directory
output_path = '../public/data/lnos2.csv'
new_lnos.to_csv(output_path, index=False)

print(f'Data saved to {output_path}')

with open('../public/data/deezer_responses.json', 'w') as f:
    json.dump(responses, f, indent=2)
