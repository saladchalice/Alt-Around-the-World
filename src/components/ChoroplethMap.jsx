import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import RadialMenu from './RadialMenu';

const ChoroplethMap =  ({ onCountrySelect, onSongSelect  }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [menuState, setMenuState] = useState({
        show: false,
        countryData: null,
        position: { x: 0, y: 0 }
    });

    useEffect(() => {
        const loadData = async () => {
            const data = await d3.csv(process.env.PUBLIC_URL + '/data/lnos2.csv', (row) => ({
                country: row.country,
                genre: row.genre,
                artist: row.artist,
                songName: row["song name"],
                album_url: row.album_url,
                preview_url: row.preview_url
            }));
            createChoropleth(data);
        };

        const createChoropleth = async (data) => {
            const width = window.innerWidth * 0.8;
            const height = window.innerHeight;

            const exceptions = new Set(["of", "the", "and", "in", "on", "at", "for"]);

            const countryStats = d3.rollup(
                data,
                v => ({
                    count: v.length,
                    songs: v.map(d => `${d.songName} - ${d.artist}`),
                    preview_urls: v.map(d => d.preview_url),
                    album_urls: v.map(d => d.album_url)
                }),
                d => d.country
                    .split(' ')
                    .map(word =>
                        exceptions.has(word.toLowerCase())
                            ? word.toLowerCase()
                            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
            );

            const world = await d3.json(process.env.PUBLIC_URL+'/data/countries.geojson');

            const zoom = d3.zoom()
                .scaleExtent([1.25, 12])
                .translateExtent([[0, 0], [width, height]])
                .on('zoom', zoomed);

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'lnos-chart');

            const projection = d3.geoNaturalEarth1()
                .fitExtent([[0, 0], [width, height]], world);

            const path = d3.geoPath().projection(projection);          

            const tooltip = d3.select(tooltipRef.current)
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background", "white")
                .style("border", "1px solid rgba(0,0,0,0.1)")
                .style("border-radius", "6px")
                .style("padding", "10px")
                .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.1)")
                .style("font-family", "Inter")
                .style("font-size", "12px")
                .style("line-height", "1.4")
                .style("pointer-events", "none")
                .style("z-index", "1000");

            const mouseover = function (event, d) {
                const countryName = d.properties.ADMIN;
                onCountrySelect(countryName);
            
                d3.selectAll(".country").style("opacity", 0.75);
                d3.select(this)
                    .style("stroke-width", 0.6)
                    .style("stroke", "black")
                    .style("opacity", 1)
                    .classed("hover", true);
            
                event.stopPropagation();
            
                const countryData = countryStats.get(d.properties.ADMIN);
                const centroid = path.centroid(d); // Calculate the centroid of the country
                const transform = d3.zoomTransform(g.node());
            
                const transformedX = transform.applyX(centroid[0]);
                const transformedY = transform.applyY(centroid[1]);
            
                if (countryData) {
                    setMenuState({
                        show: true,
                        countryData: countryData,
                        position: {
                            x: transformedX,
                            y: transformedY
                        }
                    });
                }
            };

            const mouseleave = function () {
                tooltip.style("opacity", 0);
                d3.selectAll(".country").style("opacity", 1).style("stroke", "#282828").style("stroke-width", .2);
                d3.select(this).style("stroke", "black").classed('hover', false);
            };

            const maxCount = d3.max(Array.from(countryStats.values()), d => d.count) || 1;
            const colorScale = d3.scaleSequential(d3.interpolateHcl("#AFC6E9", "#08142E"))
                .domain([0, maxCount]);

            svg.call(zoom);
            svg.selectAll('g').remove();

            const g = svg.append('g');

            g.selectAll('path')
                .data(world.features)
                .join('path')
                .attr('d', path)
                .attr('fill', d => {
                    const countryName = d.properties.ADMIN;
                    return countryStats.has(countryName) ? colorScale(countryStats.get(countryName).count) : '#fff';
                })
                .attr('stroke', '#282828')
                .attr('stroke-width', 0.2)
                .attr('class', 'country')
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave);

            const defaultScale = 1.25;
            const tx = width / 2;
            const ty = height / 2;

            svg.call(zoom.transform, d3.zoomIdentity
                .translate(tx, ty)
                .scale(defaultScale)
                .translate(-width / 2, -height / 2));

            function zoomed(event) {
                g.attr('transform', event.transform);
            }
        };

        loadData();
    }, [onCountrySelect]);

    const closeMenu = () => {
        setMenuState(prev => ({ ...prev, show: false }));
    };

    return (
        <div>
            <div ref={tooltipRef} className="tooltip"></div>
            <svg ref={svgRef}></svg>
            {menuState.show && (
                <RadialMenu 
                    countryData={menuState.countryData} 
                    position={menuState.position}
                    onClose={closeMenu}
                    onSongSelect={onSongSelect}
                />
            )}
            <div 
            style={{
                position: 'absolute',
                bottom: '0px', // Slight padding from the bottom of the container
                left: '50%',
                transform: 'translateX(-50%)',
                width: '99%', // Matches the width of the parent container
                maxWidth: '80vw', // Ensures it doesn't exceed the SVG width
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: 'white',
                textAlign: 'center',
                padding: '10px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                zIndex: 1000
            }}
        >
            Hover to select a country, use arrow keys to select a song, press space to play the song, and escape to exit the menu.
        </div>
        </div>
    );
};

export default ChoroplethMap;