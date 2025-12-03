"use client";

import React, { useState, useMemo } from 'react';
import './globals.css';
import rawData from './data.json';

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



export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineItem | null>(null);

  const processedData = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length === 0) return [];
    const minDate = new Date(sorted[0].date).getTime();
    const maxDate = new Date(sorted[sorted.length - 1].date).getTime();
    const timeSpan = maxDate - minDate;

    return sorted.map((item) => ({
      ...item,
      position: timeSpan === 0 ? 50 : ((new Date(item.date).getTime() - minDate) / timeSpan) * 90 + 5 
    }));
  }, []);

  return (
    <main className="histography-container">
      <header className="header">
        <h1>VOCALOID HISTORY <span className="subtitle">IN THE WEST</span></h1>
      </header>

      <div className="timeline-track">
        <div className="line"></div>
        {processedData.map((item) => (
          <div 
            key={item.rank}
            className={`node ${item.type} ${selectedEvent?.rank === item.rank ? 'active' : ''}`}
            style={{ left: `${item.position}%` }}
            onClick={() => setSelectedEvent(item)}
          >
            <div className="node-dot"></div>
            <div className="node-date">{new Date(item.date).getFullYear()}</div>
            <div className="node-hover-title">{item.title}</div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="event-details fade-in">
          <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
          <h2>{selectedEvent.title}</h2>
          <span className="badge">{selectedEvent.type.toUpperCase()}</span>
          <p className="date">
            {new Date(selectedEvent.date).toDateString()}
            
            {/* if artist exists, render this part */}
            {selectedEvent.artist && (
              <>
                <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
                <span className="artist-name" style={{ color: "var(--accent)" }}>
                  {selectedEvent.artist}
                </span>
              </>
            )}
          </p>
          
          <hr/>
          
          {selectedEvent.videoId && (
            <div className="video-container">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedEvent.videoId}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          )}

          <p className="description">{selectedEvent.desc}</p>
          <div className="impact-box">
            <strong>Cultural Impact:</strong>
            <p>{selectedEvent.impact}</p>
          </div>
        </div>
      )}
      
      <div className="bg-gradient"></div>
    </main>
  );
}