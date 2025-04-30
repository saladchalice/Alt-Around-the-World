// RadialMenu.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import '../index.scss';
import PropTypes from 'prop-types';

const RadialMenu = ({ countryData, position, onClose, onSongSelect }) => {
    const menuRef = useRef();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Clean up audio when component unmounts or menu closes
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // misc functions --------------------------------------------------------
    const getPreviewUrl = async (trackId) => {
        const res = await fetch(`https://deezer-api-psi.vercel.app/api/preview?trackId=${trackId}`);
        const data = await res.json();
        return data.preview;
      };
      

    const handleSongSelect = useCallback((index) => {
        if (!countryData || !onSongSelect) return;
        
        onSongSelect({
          song: countryData.songs[index],
          artist: countryData.artist,
          albumUrl: countryData.album_urls[index]
        });
    }, [countryData, onSongSelect]);

    const changeSelection = useCallback((direction) => {
        if (!countryData) return;
        
        // Stop current playback
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      
        // Calculate new index with wrap-around
        const newIndex = (selectedIndex + direction + countryData.count) % countryData.count;
        setSelectedIndex(newIndex);
        handleSongSelect(newIndex);
    }, [countryData, selectedIndex, handleSongSelect]);


    const togglePlayback = useCallback(async () => {
        console.log(countryData.track_id);
        if (!countryData?.track_ids?.[selectedIndex]) return;
              
        const trackId = countryData.track_ids?.[selectedIndex];
        console.log("Track ID:", trackId);
      
        try {
          const preview = await getPreviewUrl(trackId); // <-- use it here
      
          if (!preview) {
            console.error("No preview available");
            return;
          }
      
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(preview);
            await audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.onended = () => setIsPlaying(false);
          }
        } catch (err) {
          console.error("Error fetching preview:", err);
        }
      }, [countryData, selectedIndex, isPlaying]);
      

    

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!countryData) return;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    changeSelection(1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    changeSelection(-1);
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlayback();
                    break;
                case 'Escape':
                    onClose();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [countryData, selectedIndex, isPlaying, changeSelection, togglePlayback, onClose]);

    

    

    useEffect(() => {
        if (!countryData) return;

        const radialMenu = d3.select(menuRef.current);
        radialMenu.selectAll('*').remove();

        // Menu dimensions and calculations
        const menuWidth = 100;
        const menuHeight = 100;
        const count = countryData.count;
        const baseRadius = 50 + (count - 1) * 2; // Adjust radius based on count
        const angleIncrement = (2 * Math.PI) / count;
        
        // Icon sizing
        const maxSize = 80;
        const minSize = 50;
        const iconSize = Math.max(minSize, maxSize - count * 2);
        

        // Helper function to create album image HTML
        const displayAlbumImage = (albumUrl, size, isSelected) => {
            const border = isSelected ? '3px solid #4CAF50' : '1px solid rgba(0,0,0,0.1)';
            const transform = isSelected ? 'scale(1.1)' : 'scale(1)';
            
            if (!albumUrl) {
                return `<img src="${process.env.PUBLIC_URL}/images/nopreview.png" 
                        alt="No Preview Available" 
                        style="width: ${size}px; height: ${size}px; border-radius: 50%; 
                               border: ${border}; box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
                               transform: ${transform}; transition: all 0.2s ease;" />`;
            }
            return `<img src="${albumUrl}" 
                    alt="Album Art" 
                    style="width: ${size}px; height: ${size}px; border-radius: 50%; 
                           border: ${border}; box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
                           transform: ${transform}; transition: all 0.2s ease;" />`;
        };

        // Create inner container
        const inner = radialMenu.append("div")
            .attr("class", "radial-inner")
            .style("position", "relative")
            .style("width", `${menuWidth}px`)
            .style("height", `${menuHeight}px`);

        const centerX = menuWidth / 2;
        const centerY = menuHeight / 2;
        const radius = baseRadius;

        // Create song items
        inner.selectAll('div')
            .data(countryData.songs)
            .enter()
            .append('div')
            .attr('class', 'song-container')
            .style('position', 'absolute')
            .style('transform', (d, i) => {
                const angle = i * angleIncrement - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return `translate(${x}px, ${y}px)`;
            })
            .html((d, i) => {
                const albumUrl = countryData.album_urls[i];
                const isSelected = i === selectedIndex;
                return `
                    <div class="song-container" data-index="${i}">
                        <div class="url-container">
                            ${displayAlbumImage(albumUrl, iconSize, isSelected)}
                        </div>
                    </div>
                `;
            })
            .style('left', (d, i) => {
                const angle = i * angleIncrement - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle) - iconSize / 2;
                return `${x}px`;
            })
            .style('top', (d, i) => {
                const angle = i * angleIncrement - Math.PI / 2;
                const y = centerY + radius * Math.sin(angle) - iconSize / 2;
                return `${y}px`;
            })
            .on('click', (event, d) => {
                const index = parseInt(event.currentTarget.getAttribute('data-index'));
                setSelectedIndex(index);
                handleSongSelect(index); // Notify parent component of selection
                togglePlayback(); // Keep existing playback behavior
              });

        // Show the menu
        // Adjust position so menu stays within the viewport
        let x = position.x;
        let y = position.y;

        // Prevent right overflow
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10; // 10px padding
        }

        // Prevent bottom overflow
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        // Prevent left overflow
        if (x < 0) x = 10;

        // Prevent top overflow
        if (y < 0) y = 10;

        radialMenu
        .style('left', `${x - menuWidth / 2}px`)
        .style('top', `${y - menuHeight / 2}px`)
        .style('opacity', 0)
        .style('transform', 'scale(0.5)')
        .style('transform-origin', 'center center')
        .transition()
        .duration(500)
        .ease(d3.easeBackOut) // <-- Overshoots slightly and settles
        .style('opacity', 1)
        .style('transform', 'scale(1)');


    }, [countryData, position, selectedIndex, isPlaying, handleSongSelect, togglePlayback]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="radial-menu"
            style={{
                position: "absolute",
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: "translate(-50%, -50%)",
                opacity: 0,
                background: "transparent",
                borderRadius: "6px",
                padding: "5px",
                fontFamily: "Inter",
                fontSize: "12px",
                lineHeight: "1.4",
                pointerEvents: "none",
                zIndex: "1000",
            }}
            tabIndex="0" 
        />
    );
};

export default RadialMenu;

RadialMenu.propTypes = {
    countryData: PropTypes.object,
    position: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSongSelect: PropTypes.func.isRequired
  };