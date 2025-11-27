"use client";

import React, { useState, useMemo } from 'react';
import './globals.css';

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  type: 'event' | 'song';
  desc: string;
  impact: string;
  videoId?: string; 
  position?: number;
}

// example data, ty gemini :3
const rawData: TimelineItem[] = [
  { 
    id: 1, 
    title: "Hatsune Miku Release", 
    date: "2007-08-31", 
    type: "event", 
    desc: "Crypton Future Media releases Miku using the Vocaloid 2 engine.", 
    impact: "Sparked the global phenomenon.",
    // no video
  },
  { 
    id: 2, 
    title: "World is Mine", 
    date: "2008-05-31", 
    type: "song", 
    desc: "Produced by ryo (Supercell). The quintessential 'princess' song.", 
    impact: "Considered the 'anthem' of Miku.",
    videoId: "EuJ6UR_pD5s" 
  },
  { 
    id: 3, 
    title: "Miku Expo LA", 
    date: "2011-07-02", 
    type: "event", 
    desc: "First major North American concert.", 
    impact: "Solidified Western fanbase.",
    videoId: "rL5YXF8oeTU" 
  },
  { 
    id: 4, 
    title: "Porter Robinson uses Avanna", 
    date: "2014-08-12", 
    type: "song", 
    desc: "Porter releases 'Sad Machine' using Vocaloid Avanna.", 
    impact: "Bridged EDM and Vocaloid culture in the West.",
    videoId: "HAIDqt2aUso"
  },
  { 
    id: 5, 
    title: "Coachella Performance", 
    date: "2020-04-10", 
    type: "event", 
    desc: "Miku scheduled for Coachella (delayed due to pandemic).", 
    impact: "Mainstream Western recognition.",
    videoId: "9N1iw_w9Iu8"
  },
  { 
    id: 6, 
    title: "Mesmerizer", 
    date: "2024-05-01", 
    type: "song", 
    desc: "Viral hit by Satsuki", 
    impact: "Exploded on TikTok, introducing Gen Alpha to Vocaloid.",
    videoId: "19y8YTbvri8"
  }
];

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
            key={item.id}
            className={`node ${item.type} ${selectedEvent?.id === item.id ? 'active' : ''}`}
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
          <p className="date">{new Date(selectedEvent.date).toDateString()}</p>
          
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