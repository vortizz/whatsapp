const AVATAR_COLORS = [
  '#C0392B',
  '#8E44AD',
  '#2980B9',
  '#16A085',
  '#27AE60',
  '#D35400',
  '#57818A',
  '#E91E63',
  '#673AB7',
  '#009688',
  '#795548',
  '#E64A19',
  '#0288D1',
  '#00796B',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[hashString(name.trim()) % AVATAR_COLORS.length]
}
