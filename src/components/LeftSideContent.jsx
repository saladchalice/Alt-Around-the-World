import React, {useEffect, useState } from 'react';

const getFlagUrl = (code) =>
  code ? `https://flagcdn.com/24x18/${code.toLowerCase()}.png` : '';

const LeftSideContent =  ({ selectedCountry, selectedSong }) => {
    const [flagUrl, setFlagUrl] = useState('');

    useEffect(() => {
        if (!selectedCountry) return;
        const fetchFlag = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/data/CountryCodesWithFlags.json`);
                const data = await response.json();

                const match = data.find(
                (country) => country.name.toLowerCase() === selectedCountry.toLowerCase()
                );

                if (match && match.code) {
                setFlagUrl(getFlagUrl(match.code));
                } else {
                setFlagUrl('');
                }
            } catch (error) {
                console.error('Error loading country codes:', error);
                setFlagUrl('');
            }
        };

        fetchFlag();
    }, [selectedCountry]);

    return (
        <div id="left-side">
            <div id="title-container">
                <h2>Alt Around the World</h2>
                <img src={process.env.PUBLIC_URL + "/images/logo.png"} style={{width: '50px'}} alt="Logo" />
            </div>
            <div className="selection-display">
                {selectedCountry && (
                <div className="country-selection">
                    <h3 id="exploring">Currently Exploring:</h3>
                    <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {selectedCountry}
                        {flagUrl && <img src={flagUrl} alt={`${selectedCountry} flag`} />}
                    </h2>
                    {selectedSong && (
                    <div className="song-selection">
                        <p>Selected: <strong>{selectedSong.song}</strong></p>
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

            <div id="playlist-links">
                <a
                    className='link'
                    href="https://docs.google.com/spreadsheets/d/1IEafrUyNPCkXkxiRKXChc9PNmyM4Ide2TY3NQxFhkmg/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <img
                        src={process.env.PUBLIC_URL + '/images/sheetslogo.png'}
                        style={{ height: '40px' }}
                        alt="Google Sheets"
                        title="View on Google Sheets"
                    />
                    </a>

                    <a
                    className='link'
                    href="https://www.tunemymusic.com/share/s0boJrQ4Q4"
                    target="_blank"
                    rel="noopener noreferrer"
                    >   
                    <img
                        src={process.env.PUBLIC_URL + '/images/deezerlogo.png'}
                        style={{ height: '40px' }}
                        alt="Deezer"
                        title="View on Deezer"
                    />
                    </a>

                    <a
                    className='link'
                    href="https://www.tunemymusic.com/share/s0boJrQ4Q4"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <img
                        src={process.env.PUBLIC_URL + '/images/tiktok.png'}
                        style={{ height: '40px' }}
                        alt="Tiktok"
                        title="View on TikTok, Coming Soon!"
                    />
                    </a>
            </div>

            <div className="text-container">
                <p className="text">
                    For several years, I have been compiling <span id="emphasis">
                    a curated list of indie/alternative rock music from <strong>every country/territory in the world</strong></span>, 
                    with a de-emphasis on large majority-anglophone countries (USA, UK, Australia, NZ).
                    So far I'm up to 102!
                </p>
                <p className="text">
                    In the making of this playlist, I've gotten to listen to indie and alternative artists from
                     music cultures around the world that I would've never been able to encounter otherwise.
                    Some highlights for me are <strong>Singapore, Kenya, the Faroe Islands, and Peru!</strong>
                </p>
                <p className="text">Note: In the case of certain artists, their music is not available on streaming services. 
                    They can, however, often be located on YouTube, and for any song that I can't display here, I highly recommend throwing them into a Youtube search bar and checking them out
                    (as in the case of <strong>Dillie from Madagascar, O-Hum of Iran, and arches of China</strong>)</p>
            </div>
            
            <div>
                    <p className="disclaimer">This project makes use of the Deezer API to retrieve publicly available music metadata including album artwork and audio previews. All data obtained via the Deezer API is subject to Deezer's terms of use and is used solely for educational and non-commercial purposes. This project does not store or redistribute full tracks or any copyrighted content beyond what is returned through official API endpoints. Album covers and audio previews are fetched dynamically and are not hosted by this application. All rights to music content, imagery, and associated metadata belong to Deezer and the respective artists, labels, and rights holders.</p>
                </div>
        </div>
    );
};

export default LeftSideContent;