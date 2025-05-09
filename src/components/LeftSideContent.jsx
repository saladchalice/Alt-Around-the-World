import React from 'react';

const LeftSideContent =  ({ selectedCountry, selectedSong }) => {
    return (
        <div id="left-side">
            <h2>Alt Around the World</h2>
            <div className="selection-display">
                {selectedCountry && (
                <div className="country-selection">
                    <h3>Currently Exploring:</h3>
                    <h2>{selectedCountry}</h2>
                    {selectedSong && (
                    <div className="song-selection">
                        <p>Now Playing: <strong>{selectedSong.song}</strong></p>
                        {selectedSong.albumUrl && (
                        <img 
                            src={selectedSong.albumUrl} 
                            alt="Album cover" 
                            className="album-thumbnail"
                        />
                        )}
                    </div>
                    )}
                </div>
                )}
            </div>

            <div className="text-container">
                <p className="text">
                    For several years, I have been compiling <span id="emphasis">
                    a curated list of indie/alternative rock music from <strong>every country/territory in the world</strong></span>, 
                    with a de-emphasis on large majority-anglophone countries (USA, UK, Australia, NZ).
                    So far I'm up to 95!
                </p>
                <p className="text">
                    In the making of this playlist, I've gotten to listen to indie and alternative artists from
                     music cultures around the world that I would've never been able to encounter otherwise.
                    Some highlights for me are <strong>Singapore, Kenya, the Faroe Islands, and Peru!</strong>
                </p>
            </div>
            
            <div>
                    <p className="disclaimer">This project makes use of the Deezer API to retrieve publicly available music metadata including album artwork and audio previews. All data obtained via the Deezer API is subject to Deezer's terms of use and is used solely for educational and non-commercial purposes. This project does not store or redistribute full tracks or any copyrighted content beyond what is returned through official API endpoints. Album covers and audio previews are fetched dynamically and are not hosted by this application. All rights to music content, imagery, and associated metadata belong to Deezer and the respective artists, labels, and rights holders.</p>
                </div>
        </div>
    );
};

export default LeftSideContent;