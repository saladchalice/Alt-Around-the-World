import React from 'react';
import Select from 'react-select';


const CountrySearch = ({ countryOptions, onSelectCountry }) => {
    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left:'50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '300px',
        }}>
            <Select
                options={countryOptions}
                onChange={(option) => onSelectCountry(option ? option.value : null)}
                placeholder="Search for a country..."
                isClearable
                />
        </div>
    );
};

export default CountrySearch;