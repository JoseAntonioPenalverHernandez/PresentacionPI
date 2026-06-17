let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// Play a sharp retro menu click sound (metallic tick)
export const playClickSound = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  } catch (e) {
    console.warn("Audio click blocked by browser autoplay policy");
  }
};

// Play a subtle high-frequency menu hover beep
export const playHoverSound = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Blocked silently
  }
};

// Play a card swish sound (smooth low-to-high sweep)
export const playCardSwish = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    // Blocked silently
  }
};

// Play retro game fanfare on start exploration (rising major chord)
export const playFanfareSound = () => {
  try {
    initAudio();
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (brassy quest chime)
    const now = audioCtx.currentTime;
    
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);
      
      gain.gain.setValueAtTime(0, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.22);
      
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.22);
    });
  } catch (e) {
    console.warn("Audio fanfare blocked");
  }
};

// Background Music loop arpeggiator
let bgmInterval = null;
let activeOscillators = [];

export const startBGM = () => {
  try {
    initAudio();
    if (bgmInterval) return; // Already running
    
    // Atmospheric RPG arpeggio chords in A minor, G major, F major, E minor
    const scale = [
      [220.00, 261.63, 329.63, 440.00], // Am: A3, C4, E4, A4
      [196.00, 246.94, 293.66, 392.00], // G:  G3, B3, D4, G4
      [174.61, 220.00, 261.63, 349.23], // F:  F3, A3, C4, F4
      [164.81, 196.00, 246.94, 329.63]  // Em: E3, G3, B3, E4
    ];
    
    let chordIdx = 0;
    let noteIdx = 0;
    
    const playNextNote = () => {
      if (!audioCtx || audioCtx.state === 'suspended') return;
      
      const chord = scale[chordIdx];
      const freq = chord[noteIdx];
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      // Soft ambient volume settings
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 0.3); // soft attack
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.6); // slow decay
      
      osc.start();
      osc.stop(audioCtx.currentTime + 1.6);
      
      activeOscillators.push(osc);
      if (activeOscillators.length > 20) {
        activeOscillators.shift();
      }
      
      noteIdx = (noteIdx + 1) % chord.length;
      if (noteIdx === 0) {
        chordIdx = (chordIdx + 1) % scale.length;
      }
    };
    
    // Play notes in sequence every 600ms
    bgmInterval = setInterval(playNextNote, 600);
  } catch (e) {
    console.error("BGM error", e);
  }
};

export const stopBGM = () => {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {}
  });
  activeOscillators = [];
};
