export default function createAudioCtrl() {
  const ctrl = {};
  const context = new AudioContext();
  ctrl.context = context;
  ctrl.masterGainNode = context.createGain();
  ctrl.masterGainNode.connect(context.destination);

  return ctrl;
}
const notes = [
  {
    C: 16.35,
    "C#": 17.32,
    D: 18.35,
    "D#": 19.45,
    E: 20.6,
    F: 21.83,
    "F#": 23.12,
    G: 24.5,
    "G#": 25.96,
    A: 27.5,
    "A#": 29.14,
    B: 30.87,
  },
  {
    C: 32.7,
    "C#": 34.65,
    D: 36.71,
    "D#": 38.89,
    E: 41.2,
    F: 43.65,
    "F#": 46.25,
    G: 49,
    "G#": 51.91,
    A: 55,
    "A#": 58.27,
    B: 61.74,
  },
  {
    C: 65.41,
    "C#": 69.3,
    D: 73.42,
    "D#": 77.78,
    E: 82.41,
    F: 87.31,
    "F#": 92.5,
    G: 98,
    "G#": 103.83,
    A: 110,
    "A#": 116.54,
    B: 123.47,
  },
  {
    C: 130.81,
    "C#": 138.59,
    D: 146.83,
    "D#": 155.56,
    E: 164.81,
    F: 174.61,
    "F#": 185,
    G: 196,
    "G#": 207.65,
    A: 220,
    "A#": 233.08,
    B: 246.94,
  },
  {
    C: 261.63,
    "C#": 277.18,
    D: 293.66,
    "D#": 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    G: 392,
    "G#": 415.3,
    A: 440,
    "A#": 466.16,
    B: 493.88,
  },
  {
    C: 523.25,
    "C#": 554.37,
    D: 587.33,
    "D#": 622.25,
    E: 659.25,
    F: 698.46,
    "F#": 739.99,
    G: 783.99,
    "G#": 830.61,
    A: 880,
    "A#": 932.33,
    B: 987.77,
  },
  {
    C: 1046.5,
    "C#": 1108.73,
    D: 1174.66,
    "D#": 1244.51,
    E: 1318.51,
    F: 1396.91,
    "F#": 1479.98,
    G: 1567.98,
    "G#": 1661.22,
    A: 1760,
    "A#": 1864.66,
    B: 1975.53,
  },
  {
    C: 2093,
    "C#": 2217.46,
    D: 2349.32,
    "D#": 2489.02,
    E: 2637.02,
    F: 2793.83,
    "F#": 2959.96,
    G: 3135.96,
    "G#": 3322.44,
    A: 3520,
    "A#": 3729.31,
    B: 3951.07,
  },
  {
    C: 4186.01,
    "C#": 4434.92,
    D: 4698.63,
    "D#": 4978.03,
    E: 5274.04,
    F: 5587.65,
    "F#": 5919.91,
    G: 6271.93,
    "G#": 6644.88,
    A: 7040,
    "A#": 7458.62,
    B: 7902.13,
  },
];

function noteToFrequency(note) {
  const oct = note.replace(/.*([0-9]+).*/g, "$1");
  const tone = note.replace(/[0-9]/gi, "");
  const freq = notes[parseInt(oct)][tone];
  if (typeof freq === "undefined") {
    console.error(`Note ${note} not valid`);
    return;
  }
  return freq;
}

export function playSound(gameState, soundConf = {}) {
  // "sine", "square", "sawtooth", "triangle"
  const sound = { ...{ note: "A4", duration: 0.05, volume: 0.3, oscillator: "square" }, ...soundConf };

  if (sound.note) {
    const audioCtrl = gameState.getState("audioCtrl");
    const { context, masterGainNode } = audioCtrl;
    masterGainNode.gain.setValueAtTime(sound.volume, context.currentTime);

    const oscillator = context.createOscillator();
    const freq = noteToFrequency(sound.note);
    oscillator.type = sound.oscillator;
    oscillator.frequency.setValueAtTime(freq, context.currentTime); // value in hertz
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + sound.duration);
  }

  return new Promise((done) => setTimeout(done, sound.duration * 1000));
}
