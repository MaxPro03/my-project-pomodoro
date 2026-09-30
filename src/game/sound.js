// Tiny chiptune sound effects on square waves, no audio files needed
let ctx = null

function note(freq, start, length, volume = 0.08) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + length)
}

function play(notes) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    notes.forEach(([freq, start, length]) => note(freq, start, length))
  } catch (e) {}
}

export const sfx = {
  blip: () => play([[880, 0, 0.06]]),
  pause: () => play([[440, 0, 0.06], [330, 0.07, 0.08]]),
  // coin-style arpeggio when an orange lands in the crate
  harvest: () => play([[523, 0, 0.08], [659, 0.08, 0.08], [784, 0.16, 0.08], [1047, 0.24, 0.2]]),
  crate: () => play([[523, 0, 0.1], [784, 0.1, 0.1], [1047, 0.2, 0.1], [1319, 0.3, 0.1], [1568, 0.4, 0.3]]),
  breakOver: () => play([[784, 0, 0.1], [587, 0.12, 0.1], [784, 0.24, 0.2]]),
}
