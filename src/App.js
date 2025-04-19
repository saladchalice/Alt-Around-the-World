import logo from './logo.svg';
import React from 'react';
import LeftSideContent from './components/LeftSideContent';
import ChoroplethMap from './components/ChoroplethMap';
import './styles/style.css';

function App() {

  return (
    <div id="grid-container">
        <LeftSideContent />
        <div id="lnos-container">
            <ChoroplethMap />
        </div>
    </div>
);
}

export default App;
