import React from 'react';

const LeftSideContent =  ({ selectedCountry, selectedSong }) => {
    return (
        <div id="left-side">
            <h2>Alt Around the World</h2>
            <h5>Alternatively, "Long Night of Solace"</h5>
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
{/* New selection display */}
            <div className="selection-display">
                {selectedCountry && (
                <div className="country-selection">
                    <h3>Currently Exploring: {selectedCountry}</h3>
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
        </div>
    );
};

export default LeftSideContent;