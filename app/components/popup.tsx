// components/popup.tsx
import React, { useState, useEffect } from 'react';
import {Inconsolata} from 'next/font/google'

const inconsolata = Inconsolata({
  subsets: ['latin']
})

const welcomeText = [
  "hiii & welcome to a vocaloid timeline!! :D",
  "this is an interactive timeline of some of the pivotal events in vocaloid history + releases of the top ~75 most popular vocaloid songs (on youtube) + songs that i personally really enjoy ;)",
  "i grew up in the us, so this is western-biased (hence using youtube view count as the popularity metric) & may not include some really pivotal songs/events in jp vocaloid history (e.g. any songs popular exclusively to niconico, or very early songs such as melt). please keep that in mind!",
  "additionally, i do not profess to be an expert at all on vocaloid history. i just grew up with unrestricted internet access in the 2010s in the animation meme/weeb community iykyk :p",
  "that being said i hope you enjoy exploring this timeline!!!!!!!"
];

const Popup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [step, setStep] = useState(0);
  

  // check Local Storage on first load
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');

    if (!hasSeenPopup) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < welcomeText.length - 1) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem('hasSeenWelcomePopup', 'true');
    }
  };

  if (!isVisible) {
    return null; // don't render anything if not visible
  }

  const buttonText = step === welcomeText.length - 1 ? 'start!!!!!!!!!!!!' : 'next';

  return (
    
    <div className={`popup-overlay ${inconsolata.className}`} >
      <div className="event-details popup-window">
        <p className="popup-text">{welcomeText[step]}</p>
        <button className="popup-button" onClick={handleNext}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Popup;