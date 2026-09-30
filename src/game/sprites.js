// 12x12 pixel orange. k outline, o body, w highlight, d shadow, b stem, L leaf, e eyes, c cheeks, m mouth
export const ORANGE = [
  '.....b.LL...',
  '.....bLLL...',
  '...kkbkkk...',
  '..kowwoook..',
  '.kowwoooook.',
  '.koweooeook.',
  '.kooeooeodk.',
  '.kocommocdk.',
  '.kooooooddk.',
  '.kooooodddk.',
  '..kooddddk..',
  '...kkkkkk...',
]

const base = { k: '#3b1d0e', b: '#6b3a14', L: '#3fa535', e: '#2b1408', c: '#ff7b9c', m: '#7a2a10' }

// the orange ripens while you focus
export const PALETTES = {
  unripe: { ...base, o: '#6fbf3a', w: '#b8f07a', d: '#3f8a22' },
  ripening: { ...base, o: '#e6c42a', w: '#fff39a', d: '#b08a12' },
  ripe: { ...base, o: '#f7901e', w: '#ffe0a0', d: '#c8560f' },
  ghost: { k: '#4a4f6a', b: '#4a4f6a', L: '#4a4f6a', o: '#2b2f45', w: '#2b2f45', d: '#2b2f45', e: '#3d4260', c: '#2b2f45', m: '#3d4260' },
}

export const paletteForProgress = (progress) =>
  progress < 0.4 ? PALETTES.unripe : progress < 0.8 ? PALETTES.ripening : PALETTES.ripe
