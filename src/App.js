import React, { useState } from 'react';
import LeftSideContent from './components/LeftSideContent';
import ChoroplethMap from './components/ChoroplethMap';
import './styles/style.css';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  return (
    <div id="grid-container">
      <LeftSideContent 
        selectedCountry={selectedCountry} 
        selectedSong={selectedSong} 
      />
      <div id="lnos-container">
        <ChoroplethMap 
          onCountrySelect={setSelectedCountry}
          onSongSelect={setSelectedSong}
        />
      </div>
    </div>
  );
}

export default App;