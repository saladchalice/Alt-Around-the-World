import React from 'react';

const LeftSideContent = () => {
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
            <div>
            <iframe
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/45lMrjDlH4w4d0cJxGDyW3?utm_source=generator"
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            ></iframe>

            </div>
        </div>
    );
};

export default LeftSideContent;