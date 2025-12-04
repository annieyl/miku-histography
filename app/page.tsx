"use client";

import { useState, useMemo, useEffect } from 'react';
import './globals.css';
import rawData from './data/data.json';
import { WindSong, Inconsolata} from 'next/font/google'
import Popup from './components/popup';


const windsong   = WindSong({
  subsets: ['latin'],
  weight: '400',
})
const inconsolata = Inconsolata({
  subsets: ['latin']
})

interface TimelineItem {
  rank?: number;
  title: string;
  date: string;
  type: string;
  desc: string;
  videoId?: string;
  artist?: string;
  position?: number;
}


interface ProcessedTimelineItem extends TimelineItem {
  position: number; //left: X%
  verticalOffset: number; 
}


interface SelectedEventState {
  item: ProcessedTimelineItem;
  timelinePosition: number; //as left %age
  arrowPosition: number; 
}

interface YearMarker {
  year: number;
  position: number;
}

// CONSTANTS FOR CLAMPING AND STAGGERING
const PANEL_WIDTH_PX = 400; // match the .event-details width in CSS
const HORIZONTAL_COLLISION_THRESHOLD = 1.25;
const VERTICAL_OFFSET_STEP = 30;
const MAX_VERTICAL_LEVEL = 20;

//bg mgmt
const DEFAULT = 'url(/miku.jpg)';
const CLICK = 'url(/Hatsune_Miku_V2.png)';

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventState | null>(null);

  const [bg, setbg] = useState<string>(DEFAULT);
  
  //yes this should be css, but i am tired and the blend mode keeps not working. lol.
  useEffect(() => {
    document.body.style.backgroundImage = bg;
    document.body.style.backgroundSize = '35%';
    document.body.style.backgroundPosition = 'bottom right';
    document.body.style.backgroundBlendMode = 'multiply';
    document.body.style.backgroundRepeat = 'no-repeat';
  }, [bg]);

  const { processedData, yearMarkers } = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length === 0) return { processedData: [], yearMarkers: [] };

    const minDate = new Date(sorted[0].date).getTime() - 500 * 60 * 60 * 24 * 365; // add one year buffer
    const maxDate = new Date(sorted[sorted.length - 1].date).getTime() + 500 * 60; // add one year buffer

    //expanding 2025 b
    const YEAR_TO_EXPAND = 2025;
    const EXPANSION_FACTOR = 3; 
    const START_OF_EXPANSION = new Date(`${YEAR_TO_EXPAND}-01-01`).getTime();

    // virtual time span
    const durationBefore = Math.max(0, START_OF_EXPANSION - minDate);
    const duration2025 = Math.max(0, maxDate - START_OF_EXPANSION);
    const expandedDuration2025 = duration2025 * EXPANSION_FACTOR;
    const virtualTimeSpan = durationBefore + expandedDuration2025;

    //helper to get time elapsed
    const getVirtualTimeElapsed = (dateMs: number) => {
        if (dateMs < START_OF_EXPANSION) {
            // Standard scale before 2025
            return dateMs - minDate;
        } else {
            // Expanded scale within 2025
            const timeIn2025 = dateMs - START_OF_EXPANSION;
            return durationBefore + (timeIn2025 * EXPANSION_FACTOR);
        }
    };

    // event node positions
    const occupiedPositions: Map<number, number> = new Map();
    const processedData = sorted.map((item) => {
        const itemDateMs = new Date(item.date).getTime();
        
        const virtualTimeElapsed = getVirtualTimeElapsed(itemDateMs);
        
        // calc horizontal position (5% to 95% of the track)
        const horizontalPosition = virtualTimeSpan === 0
            ? 50
            : (virtualTimeElapsed / virtualTimeSpan) * 90 + 5;

        // ...staggering
        let finalVerticalOffset = 0;
        let level = 0;
        let isColliding = true;

        while (isColliding && level <= MAX_VERTICAL_LEVEL) {
            isColliding = false;
            const magnitude = Math.ceil(level / 2) * VERTICAL_OFFSET_STEP;
            const sign = level % 2 === 0 ? 1 : -1;
            const currentOffset = magnitude * sign;

            for (const [pos, lvl] of occupiedPositions.entries()) {
                const horizontalClash = Math.abs(pos - horizontalPosition) < HORIZONTAL_COLLISION_THRESHOLD;

                if (horizontalClash && Math.abs(lvl) === level) {
                    isColliding = true;
                    break;
                }
            }

            if (!isColliding) {
                finalVerticalOffset = currentOffset;
                break;
            }

            level++;
        }

        occupiedPositions.set(horizontalPosition, level * (level % 2 === 0 ? 1 : -1));
        // ... (End Staggering Logic)

        return {
            ...item,
            position: horizontalPosition,
            verticalOffset: finalVerticalOffset,
        };
    });

    //year markers
    const startYear = new Date(minDate).getFullYear();
    const endYear = new Date(maxDate).getFullYear();
    const markers = [];

    for (let year = startYear; year <= endYear; year++) {
        const yearDate = new Date(`${year}-01-01`).getTime();

        const virtualTimeElapsed = getVirtualTimeElapsed(yearDate);

        const position = virtualTimeSpan === 0
            ? 50
            : (virtualTimeElapsed / virtualTimeSpan) * 90 + 5;

        if (position >= 5 && position <= 95) {
            markers.push({ year, position });
        }
    }

    return { processedData, yearMarkers: markers };

}, [rawData]);


  const calculateClampedPosition = (nodeLeftPercentage: number): { clampedPosition: number, arrowPosition: number } => {

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const panelWidthPercent = (PANEL_WIDTH_PX / viewportWidth) * 100;

    let clampedPosition: number;
    
    if (nodeLeftPercentage > 40) {
      //right side
      clampedPosition = nodeLeftPercentage - 18;
    } else {
        clampedPosition = nodeLeftPercentage + 18;
    }

    const shiftPercentage = ((nodeLeftPercentage - clampedPosition) / panelWidthPercent) * 100;
    const arrowPosition = 50 + shiftPercentage;

    return { clampedPosition, arrowPosition };
  };


  const handleNodeClick = (item: ProcessedTimelineItem) => {
    const { clampedPosition, arrowPosition } = calculateClampedPosition(item.position);
    setSelectedEvent({
      item: item,
      timelinePosition: clampedPosition, 
      arrowPosition: arrowPosition,
    });
  }

  // Function to close the panel
  const closeEvent = () => {
    setSelectedEvent(null);
  }

  return (
    
    <main className={`histography-container ${inconsolata.className}`}>
      <Popup />
      <header className="header">
        <h1>a vocaloid timeline<span className="subtitle">(from a western perspective)</span></h1>
        <p> by annie liu for gen mus 175. click a timeline item to get started!!</p>
      </header>

      <div className="timeline-track">
        <div className="line"></div>

        {/* YEAR MARKERS */}
        {yearMarkers.map(marker => (
          <div
            key={marker.year}
            className="year-marker"
            style={{ left: `${marker.position}%` }}
          >
            <span className="year-label">{marker.year.toString().slice(2,)}</span>
          </div>
        ))}

        {/* TIMELINE NODES */}
        {processedData.map((item) => (
          <div
            key={item.rank}
            className={`node ${item.type} ${selectedEvent?.item.rank === item.rank ? 'active' : ''}`}
            style={{
              left: `${item.position}%`,
              transform: `translateX(-50%) translateY(${item.verticalOffset}px)`
            }}
            onClick={() => handleNodeClick(item)}
          >
            <div className="node-dot"></div>
            <div className="node-hover-title">{item.title}</div>
          </div>
        ))}
      </div>


      {/* legend */}
      <div className="node-legend">
        <p> legend:</p>
        <div className="node song" style={{position: "absolute"}}>
          <div className="node-dot"></div>
          <label> song </label>
        </div>

        <div className="node event" style={{position: "absolute", left: "60px"}}>
          <div className="node-dot"></div>
          <label> event </label>
        </div>
      </div>


      {/* EVENT DETAILS PANEL */}
      {selectedEvent && (
        <div
          className="event-details fade-in"
          style={{ left: `${selectedEvent.timelinePosition}%` }}
        >
          <button className="close-btn" onClick={closeEvent}>×</button>


          {/* TITLE & METADATA */}
          <h2 style={{fontSize: "1.25rem", marginBottom: "0.5rem"}}>{selectedEvent.item.title}</h2>
          <span className="badge" style = {{
            color: selectedEvent.item.type.toUpperCase() === 'SONG' 
              ? 'var(--accent)' 
              : 'var(--accent-secondary)'}}>
              {selectedEvent.item.type.toUpperCase()}</span>
          <p className="date" style={{color:"var(--text-color)"}}>
            {new Date(selectedEvent.item.date).toDateString().slice(4,)}

            {/* RENDER ARTIST IF IT EXISTS */}
            {selectedEvent.item.artist && (
              <>
                <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
                <span className="artist-name" style={{}}>
                  {selectedEvent.item.artist}
                </span>
              </>
            )}
          </p>

          <hr />

          {/* YOUTUBE VIDEO EMBED */}
          {selectedEvent.item.videoId && (
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${selectedEvent.item.videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* DESCRIPTION AND IMPACT */}
          <div className="impact-box">
            <strong>description</strong>
              {selectedEvent.item.rank !== undefined && selectedEvent.item.rank >= 1 && (
                <p>popularity rank: {selectedEvent.item.rank}</p>
              )}
            <p>{selectedEvent.item.desc}</p>
          </div>
        </div>
      )}

      <div className="bg-gradient"></div>

      <footer>
        <p style={{ textAlign: "right", marginTop: "2rem", marginRight: "1rem" , fontSize:"0.8rem", color:"var(--text-color)", opacity:"0.4"}}>
          song view count data scraped from vocaloard, current as of november 2025
        </p>
      </footer>

    </main>
  );
}