import React from 'react';

const LeftSideContent = () => {
    return (
        <div id="left-side">
            <h2>Alt Around the World</h2>
            <h5>Alternatively, "Long Night of Solace"</h5>
            <div className="text-container">
                <p className="text">
                    for several years, i have been compiling <span id="emphasis">
                    a curated list of indie/alternative music from every country/territory in the world</span>, 
                    with an emphasis on rock subcultures and a de-emphasis on strictly anglophone countries.
                    So far I'm up to 95!
                </p>
                <p><br /></p>
                <p className="text">
                    In the making of this playlist, I've gotten to know and appreciate indie and alternative artists from
                     music cultures around the world that I would've never been able to encounter otherwise.
                    Some highlights for me are Singapore, Kenya, the Faroe Islands, and Peru!
                </p>
            </div>
        </div>
    );
};

export default LeftSideContent;