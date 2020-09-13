export default function a1() {
    const ctrl = {}
    const context = new AudioContext()
    ctrl.context = context
    ctrl.masterGainNode = context.createGain()
    ctrl.masterGainNode.connect(context.destination)

    return ctrl
}
const notes = [
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
        B: 246.94
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
        B: 493.88
    }
]
function a2(note) {
    const oct = note.replace(/.*([0-9]+).*/g, "$1")
    const tone = note.replace(/[0-9]/gi, "")
    const freq = notes[parseInt(oct)][tone]
    if (typeof freq === "undefined") {
        console.error(`Note ${note} not valid`)
        return
    }
    return freq
}

export function a3(gameState, soundConf = {}) {
    // "sine", "square", "sawtooth", "triangle"
    const sound = {
        ...{ note: "A4", duration: 0.05, volume: 0.3, oscillator: "square" },
        ...soundConf
    }

    if (sound.note) {
        const audioCtrl = gameState.getState("audioCtrl")
        const { context, masterGainNode } = audioCtrl
        masterGainNode.gain.setValueAtTime(sound.volume, context.currentTime)

        const oscillator = context.createOscillator()
        const freq = a2(sound.note)
        oscillator.type = sound.oscillator
        oscillator.frequency.setValueAtTime(freq, context.currentTime) // value in hertz
        oscillator.connect(context.destination)
        oscillator.start()
        oscillator.stop(context.currentTime + sound.duration)
    }

    return new Promise((done) => setTimeout(done, sound.duration * 1000))
}
