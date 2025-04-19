import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChoroplethMap = () => {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        const loadData = async () => {
            const data = await d3.csv(process.env.PUBLIC_URL + '/data/lnos.csv', (row) => ({
                country: row.country,
                genre: row.genre,
                artist: row.artist,
                songName: row["song name"],
                rating: Number(row.rating)
            }));
            console.log(data);
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
                    songs: v.map(d => `${d.songName} - ${d.artist}`)
                }),
                d => d.country
                    .split(' ')
                    .map(word =>
                        exceptions.has(word.toLowerCase())
                            ? word.toLowerCase()
                            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
            );

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
                d3.selectAll(".country").style("opacity", 0.75);
                d3.select(this).style("stroke-width", .6).style("stroke", "black").style("opacity", 1).classed('hover', true);

                const countryData = countryStats.get(d.properties.ADMIN);
                if (countryData) {
                    tooltip.html(`
                        <div style="font-weight: bold; color: ${colorScale(countryData.count)}; margin-bottom: 5px">
                            ${d.properties.ADMIN}
                        </div>
                        <div style="color: #666">
                            Songs Count: <span style="color: #333; font-weight: 600;">${countryData.count}</span>
                        </div>
                        <div style="color: #666; margin-top: 5px">
                            Songs:
                            <ul style="margin: 5px 0; padding-left: 15px; color: #333; font-size: 14px">
                                ${countryData.songs.slice(0, 5).map(song => `<li>${song}</li>`).join('')}
                            </ul>
                        </div>
                    `)
                        .style("opacity", 1)
                        .style("left", Math.max(event.pageX + 10, 10) + "px")
                        .style("top", Math.max(event.pageY - 10, 10) + "px");
                } else {
                    tooltip.html(`
                        <div style="font-weight: bold; margin-bottom: 5px">${d.properties.ADMIN}</div>
                        <div style="color: #666">No songs recorded</div>
                    `)
                        .style("opacity", 1)
                        .style("left", Math.max(event.pageX + 10, 10) + "px")
                        .style("top", Math.max(event.pageY - 10, 10) + "px");
                }
            };

            const mouseleave = function () {
                tooltip.style("opacity", 0);
                d3.selectAll(".country").style("opacity", 1).style("stroke", "#282828").style("stroke-width", .2);
                d3.select(this).style("stroke", "black").classed('hover', false);
            };

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
    }, []);

    return (
        <div>
            <div ref={tooltipRef} className="tooltip"></div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default ChoroplethMap;