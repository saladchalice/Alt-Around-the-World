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
preview_urls = []
all_data = []

for i in range(len(minidata)):
    if (i + 1) % 49 == 0:
        time.sleep(5)

    song_name = remove_punctuation(minidata.iloc[i]['song name']).strip()
    artist_name = remove_punctuation(minidata.iloc[i]['artist']).strip()
    term = '+'.join(song_name.split()) + '+' + '+'.join(artist_name.split())
    
    url = f'https://api.deezer.com/search?q={term}&limit=10'
    response = requests.get(url)
    
    album_url = None
    preview_url = None
    
    if response.status_code == 200:
        response_json = response.json()
        best_score = 0
        best_match = None
        
        for item in response_json.get('data', []):
            song_match = item['title'].lower().strip()
            artist_match = item['artist']['name'].lower().strip()
            score = fuzz.partial_ratio(song_name.lower(), song_match) + fuzz.partial_ratio(artist_name.lower(), artist_match)
            
            if score > best_score:
                best_score = score
                best_match = item
        
        if best_match and best_score > 150:  # Adjust threshold as needed
            album_url = best_match['album']['cover_medium']
            preview_url = best_match['preview']

    album_urls.append(album_url)
    preview_urls.append(preview_url)

    all_data.append({
        "original_song": minidata.iloc[i]['song name'],
        "original_artist": minidata.iloc[i]['artist'],
        "album_url": album_url,
        "preview_url": preview_url
    })


new_lnos = lnos.copy()
new_lnos['album_url']=pd.Series(album_urls)
new_lnos['preview_url']=pd.Series(preview_urls)

# Save the DataFrame as CSV in the public/data directory
output_path = '../public/data/lnos2.csv'
new_lnos.to_csv(output_path, index=False)

print(f'Data saved to {output_path}')