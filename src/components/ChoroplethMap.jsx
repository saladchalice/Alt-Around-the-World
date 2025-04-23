import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChoroplethMap = () => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const menuRef = useRef();

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
            // console.log(data);
            createChoropleth(data);
        };

        const createChoropleth = async (data) => {
            const margin = { top: 0, right: 0, bottom: 0, left: 0 },
                width = window.innerWidth * 0.8,
                height = window.innerHeight;

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
            console.log(countryStats);

            // const tooltip = d3.select(tooltipRef.current)
            //     .style("opacity", 0)
            //     .style("position", "absolute")
            //     .style("background", "white")
            //     .style("border", "1px solid rgba(0,0,0,0.1)")
            //     .style("border-radius", "6px")
            //     .style("padding", "10px")
            //     .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.1)")
            //     .style("font-family", "Inter")
            //     .style("font-size", "12px")
            //     .style("line-height", "1.4")
            //     .style("pointer-events", "none")
            //     .style("z-index", "1000");

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
            //calculate centroids for each country
            // world.features.forEach((feature) => {
            //     const centroid = path.centroid(feature); // Calculate centroid for each feature
            // });
            

            // when hover, show round tooltip with country name and number of songs. when clicking the round button, expand to radial menu. 
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
            ;

            // mouse events --------------------------------------------------------------------------------------------------------------
            const mouseover = function (event, d) {
                d3.selectAll(".country").style("opacity", 0.75);
                d3.select(this)
                    .style("stroke-width", 0.6)
                    .style("stroke", "black")
                    .style("opacity", 1)
                    .classed("hover", true);
            
                const centroid = path.centroid(d); // Calculate centroid of the country
                const transform = d3.zoomTransform(g.node()); // Get the current zoom transform
                
                const transformedX = transform.applyX(centroid[0]); // Apply zoom translation to X
                const transformedY = transform.applyY(centroid[1]); // Apply zoom translation to Y
            
                const svgBounds = d3.select(svgRef.current).node().getBoundingClientRect(); // SVG's position
            
                const countryData = countryStats.get(d.properties.ADMIN);
                if (countryData) {
                    tooltip.html(`
                        <div style="font-weight: bold; color: ${colorScale(countryData.count)}; margin-bottom: 5px">
                            ${d.properties.ADMIN}
                        </div>
                        <div style="color: #666">
                            Songs Count: <span style="color: #333; font-weight: 600;">${countryData.count}</span>
                        </div>
                    `)
                    .style("opacity", 1)
                    .style("left", `${transformedX + svgBounds.left}px`) // Adjust for zoom and SVG position
                    .style("top", `${transformedY + svgBounds.top}px`); // Adjust for zoom and SVG position
                } else {
                    tooltip.html(`
                        <div style="font-weight: bold; margin-bottom: 5px">${d.properties.ADMIN}</div>
                        <div style="color: #666">No songs recorded</div>
                    `)
                    .style("opacity", 1)
                    .style("left", `${transformedX + svgBounds.left}px`) // Adjust for zoom and SVG position
                    .style("top", `${transformedY + svgBounds.top}px`); // Adjust for zoom and SVG position
                }
            };


            // establish radial menu
            const radialMenu = d3.select(menuRef.current)
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
            .style("pointer-events", "auto")
            .style("z-index", "1000");
            ;

            // on click, show a radial menu with the songs in the country. ------------------------------------------------------------------
            const click = function (event, d) {
                // Clear any previous menu items
                radialMenu.selectAll('*').remove();

                // Prevent zoom from interfering
                event.stopPropagation(); 
                console.log(d.properties.ADMIN);

                // the country data is the data for the country that was clicked on, retrived from the countryStats map
                const countryData = countryStats.get(d.properties.ADMIN);                

                // define radial menu size
                const menuWidth = 200;
                const menuHeight = 200; 

                //calculate centroid for menu positioning
                const centroid = path.centroid(d); // Calculate centroid of the country
                const transform = d3.zoomTransform(g.node()); // Get the current zoom transform
        
                const transformedX = transform.applyX(centroid[0]); // Apply zoom translation to X
                const transformedY = transform.applyY(centroid[1]); // Apply zoom translation to Y


                // define radial menu depending on if data exists or not
                if (countryData) {
                    // get song names, album urls, and preview urls
                    const songs = countryData.songs;
                    const albumUrls = countryData.album_urls;
                    const previewUrls = countryData.preview_urls;

                    // Define radius increments and angle spacing
                    const baseRadius = 50; // Start radius
                    const radiusIncrement = 30; // Space between layers
                    const angleIncrement = (2 * Math.PI) / countryData.count; // Angle between each item
                    radialMenu.selectAll('div')
                        .data(countryData) // can't just put countryData, need to put each of the songs and urls
                        .enter()
                        .append('div')
                        .attr('class', 'radial-menu-item')
                        .style('position', 'absolute')
                        .style('transform', (d, i) => {
                            const radius = baseRadius + (i * radiusIncrement); // Spiral outwards
                            const angle = i * angleIncrement; // Position item by angle
                            const x = Math.cos(angle) * radius; // X coordinate
                            const y = Math.sin(angle) * radius; // Y coordinate
                            return `translate(${x}px, ${y}px)`; // Position in spiral
                        })
                        .style('width', '40px')
                        .style('height', '40px')
                        .style('border-radius', '50%')
                        .style('background', '#ddd')
                        .style('display', 'flex')
                        .style('align-items', 'center')
                        .style('justify-content', 'center')
                        .text(d => d.label) // Add text
                        .on('click', d => alert(`Clicked ${d.label}`)); // Add click behavior
                }
                else{
                    radialMenu.html(`
                        <div style="font-weight: bold; margin-bottom: 5px">${d.properties.ADMIN}</div>
                        <div style="color: #666">No songs recorded</div>
                    `)
                    .style("opacity", 1)
                }

                // Show the radial menu
                radialMenu
                .style('opacity', 1)
                .style('left', `${transformedX - menuWidth / 2}px`) // Center the menu horizontally
                .style('top', `${transformedY - menuHeight / 2}px`); // Center the menu vertically


            }
            

            // on leave, hide the tooltip and radial menu ----------------------------------------------------------------------------
            const mouseleave = function () {
                tooltip.style("opacity", 0);
                d3.selectAll(".country").style("opacity", 1).style("stroke", "#282828").style("stroke-width", .2);
                d3.select(this).style("stroke", "black").classed('hover', false);
            };

            // set up map --------------------------------------------------------------------------------------------------------------

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
                .on("mouseleave", mouseleave)
                .on("click", click);

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
    }, []);

    return (
        <div>
            <div ref={tooltipRef} className="tooltip"></div>
            <svg ref={svgRef}></svg>
            <div ref={menuRef} className="radial-menu"></div>
        </div>
    );
};

export default ChoroplethMap;