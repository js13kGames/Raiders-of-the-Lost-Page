import { a3 } from "./audio.js"

const squareNote = (note) => ({ ...note, oscillator: "square" })
const sectOctave = (note, oct) => `${note}${oct}`

const soundEnabled = (gameState, handler) => {
    const audio = gameState.getState("audio")
    if (audio) return handler()
}

export function pick404(gameState) {
    soundEnabled(gameState, () => {
        a3(
            gameState,
            squareNote({ note: sectOctave("A", 0), duration: 0.1 })
        )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("B", 0), duration: 0.1 })
                )
            )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("G", 1), duration: 0.1 })
                )
            )
    })
}

export function pickExit(gameState) {
    soundEnabled(gameState, () => {
        a3(
            gameState,
            squareNote({ note: sectOctave("A", 0), duration: 0.1 })
        )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("B", 0), duration: 0.1 })
                )
            )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("C#", 1), duration: 0.1 })
                )
            )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("F#", 1), duration: 0.1 })
                )
            )
    })
}

export function lifeLost(gameState) {
    soundEnabled(gameState, () => {
        a3(
            gameState,
            squareNote({ note: sectOctave("F#", 1), duration: 0.1 })
        )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("C#", 1), duration: 0.1 })
                )
            )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("B", 0), duration: 0.1 })
                )
            )
            .then(() =>
                a3(
                    gameState,
                    squareNote({ note: sectOctave("A", 0), duration: 0.2 })
                )
            )
    })
}
