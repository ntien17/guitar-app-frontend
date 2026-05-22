let audioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioContext = new AudioContextClass()
  }
  return audioContext
}

export function resumeAudioContext(): void {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume()
  }
}

const noteFrequencies: Record<string, number> = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88,
}

export function getFrequency(note: string, octave: number = 4): number {
  const baseFreq = noteFrequencies[note]
  if (!baseFreq) {
    console.warn(`Unknown note: ${note}`)
    return 440
  }
  return baseFreq * Math.pow(2, octave - 4)
}

export function playNote(note: string, duration: number = 1, octave: number = 4): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext()
    resumeAudioContext()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.value = getFrequency(note, octave)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    setTimeout(resolve, duration * 1000)
  })
}

export function playChord(notes: string[], duration: number = 1, octave: number = 4): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext()
    resumeAudioContext()

    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []

    notes.forEach((note) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.value = getFrequency(note, octave)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      oscillators.push(osc)
      gains.push(gain)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    })

    setTimeout(resolve, duration * 1000)
  })
}

export function playClick(frequency: number = 1000, duration: number = 0.1): void {
  const ctx = getAudioContext()
  resumeAudioContext()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.frequency.value = frequency
  gain.gain.value = 0.2

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function stopAllSounds(): void {
  if (audioContext) {
    const allNodes = audioContext.destination
    // Note: Can't directly stop all oscillators, but they'll stop when their scheduled times come
    // To fully stop, would need to track all oscillators - for now this is a placeholder
  }
}

export function playSequence(notes: string[], interval: number = 0.5, octave: number = 4): Promise<void> {
  return new Promise(async (resolve) => {
    for (const note of notes) {
      await playNote(note, interval * 0.8, octave)
      await new Promise((r) => setTimeout(r, interval * 1000))
    }
    resolve()
  })
}

export function playChordArpeggio(
  chordNotes: string[],
  duration: number = 0.3,
  octave: number = 4
): Promise<void> {
  return playSequence(chordNotes, duration, octave)
}
