// 14x14 pixel orange. k outline, o body, w highlight, d shadow, b stem, L leaf,
// e eyes, c cheeks, m mouth, l arms and legs, g gloves, f shoes
export const ORANGE = [
  '......b.LL....',
  '......bLLL....',
  '....kkbkkk....',
  '...kowwoook...',
  '..kowwoooook..',
  '..koweooeook..',
  '..kooeooeodk..',
  '.lkocommocdkl.',
  '.gkooooooddkg.',
  '..kooooodddk..',
  '...kooddddk...',
  '....kkkkkk....',
  '.....l..l.....',
  '....ff..ff....',
]

const base = {
  k: '#3b1d0e',
  b: '#6b3a14',
  L: '#3fa535',
  e: '#2b1408',
  h: '#ffffff',
  c: '#ff7b9c',
  m: '#7a2a10',
  l: '#3b1d0e',
  g: '#fff4e0',
  f: '#8a4a1c',
}

// the orange ripens while you focus
export const PALETTES = {
  unripe: { ...base, o: '#6fbf3a', w: '#b8f07a', d: '#3f8a22' },
  ripening: { ...base, o: '#e6c42a', w: '#fff39a', d: '#b08a12' },
  ripe: { ...base, o: '#f7901e', w: '#ffe0a0', d: '#c8560f' },
  ghost: {
    ...Object.fromEntries(['k', 'b', 'L', 'l', 'g', 'f'].map((key) => [key, '#4a4f6a'])),
    ...Object.fromEntries(['o', 'w', 'd', 'c', 'h'].map((key) => [key, '#2b2f45'])),
    e: '#3d4260',
    m: '#3d4260',
  },
}

export const paletteForProgress = (progress) =>
  progress < 0.4 ? PALETTES.unripe : progress < 0.8 ? PALETTES.ripening : PALETTES.ripe
