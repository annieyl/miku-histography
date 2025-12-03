"use client";

import { useState, useMemo } from 'react';
import './globals.css';
import rawData from './data/data.json';
import { WindSong, Inconsolata} from 'next/font/google'


const windsong   = WindSong({
  subsets: ['latin'],
  weight: '400',
})
const inconsolata = Inconsolata({
  subsets: ['latin']
})

interface TimelineItem {
  rank: number;
  title: string;
  date: string;
  type: 'event' | 'song';
  desc: string;
  impact: string;
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
const HORIZONTAL_COLLISION_THRESHOLD = 1;
const VERTICAL_OFFSET_STEP = 15;
const MAX_VERTICAL_LEVEL = 20;

//bg mgmt
const DEFAULT = 'url(/Hatsune_Miku.png)';
const CLICK = 'url(/Hatsune_Miku_V2.png)';

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventState | null>(null);

  const [bg, setbg] = useState<string>(DEFAULT);
  
  //yes this should be css, but i am tired and the blend mode keeps not working. lol.
  document.body.style.backgroundImage = bg;
  document.body.style.backgroundSize = '45%';
  document.body.style.backgroundPosition = 'bottom right';
  document.body.style.backgroundBlendMode = 'multiply';
  document.body.style.backgroundRepeat = 'no-repeat';

  const { processedData, yearMarkers } = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length === 0) return { processedData: [], yearMarkers: [] };

    const minDate = new Date(sorted[0].date).getTime();
    const maxDate = new Date(sorted[sorted.length - 1].date).getTime();
    const timeSpan = maxDate - minDate;

    // calculate Event Node Positions ---
    const occupiedPositions: Map<number, number> = new Map();
    const processedData: ProcessedTimelineItem[] = sorted.map((item) => {
      // Calculate horizontal position (5% to 95% of the track)
      const horizontalPosition = timeSpan === 0
        ? 50
        : ((new Date(item.date).getTime() - minDate) / timeSpan) * 90 + 5;

      let finalVerticalOffset = 0;
      let level = 0;
      let isColliding = true;

      // Staggering logic
      while (isColliding && level <= MAX_VERTICAL_LEVEL) {
        isColliding = false;
        const currentOffset = level * VERTICAL_OFFSET_STEP * (level % 2 === 0 ? 1 : -1);

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

      return {
        ...item,
        position: horizontalPosition,
        verticalOffset: finalVerticalOffset,
      };
    });

    // --- 2. Calculate Year Marker Positions ---
    const startYear = new Date(minDate).getFullYear();
    const endYear = new Date(maxDate).getFullYear();
    const markers: YearMarker[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const yearDate = new Date(`${year}-01-01`).getTime();

      const position = timeSpan === 0
        ? 50
        : ((yearDate - minDate) / timeSpan) * 90 + 5;

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
    
    if (nodeLeftPercentage > 50) {
      // Right side
      clampedPosition = nodeLeftPercentage - 20;
    } else {
        clampedPosition = nodeLeftPercentage + 20;
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
      <header className="header">
        <h1>vocaloid history :D <span className="subtitle">(a western view)</span></h1>
        <p> by annie liu, for gen mus 175. click a timeline item to get started!!</p>
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
            <span className="year-label">{marker.year}</span>
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

      {/* EVENT DETAILS PANEL */}
      {selectedEvent && (
        <div
          className="event-details fade-in"
          // Use the CLAMPED position for the panel
          style={{ left: `${selectedEvent.timelinePosition}%` }}
        >
          <button className="close-btn" onClick={closeEvent}>×</button>

          {/* TITLE & METADATA */}
          <h2>{selectedEvent.item.title}</h2>
          <span className="badge">{selectedEvent.item.type.toUpperCase()}</span>
          <p className="date">
            {new Date(selectedEvent.item.date).toDateString()}

            {/* RENDER ARTIST IF IT EXISTS */}
            {selectedEvent.item.artist && (
              <>
                <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
                <span className="artist-name" style={{ color: "var(--accent)" }}>
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
            <p>popularity rank: {selectedEvent.item.rank}</p>
            <p>{selectedEvent.item.desc}</p>
          </div>
          <div className="impact-box">
            <strong>impact</strong>
            <p>{selectedEvent.item.impact}</p>
          </div>
        </div>
      )}

      <div className="bg-gradient"></div>

      <footer>
        <p style={{ textAlign: "right", marginTop: "2rem", marginRight: "1rem" , fontSize:"0.8rem", color:"var(--text-color)", opacity:"0.4"}}>
          data scraped from vocaloard, current as of november 2025
        </p>
      </footer>
      
    </main>
  );
}