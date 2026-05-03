import { describe, it, expect } from 'vitest'
import { getAvatarColor } from '../../utils/avatar-color'

describe('getAvatarColor', () => {
  it('should return a hex color string', () => {
    const color = getAvatarColor('Victor')
    expect(color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('should return the same color for the same name', () => {
    expect(getAvatarColor('Victor')).toBe(getAvatarColor('Victor'))
  })

  it('should return different colors for different names', () => {
    expect(getAvatarColor('Victor')).not.toBe(getAvatarColor('Caren'))
  })

  it('should handle names with extra spaces', () => {
    expect(getAvatarColor('  Victor  ')).toBe(getAvatarColor('Victor'))
  })

  it('should always return a color from the predefined palette', () => {
    const palette = [
      '#C0392B',
      '#8E44AD',
      '#2980B9',
      '#16A085',
      '#27AE60',
      '#D35400',
      '#2C3E50',
      '#E91E63',
      '#673AB7',
      '#009688',
      '#795548',
      '#E64A19',
      '#0288D1',
      '#00796B',
    ]

    expect(palette).toContain(getAvatarColor('Victor'))
    expect(palette).toContain(getAvatarColor('Caren'))
    expect(palette).toContain(getAvatarColor('RandomName123'))
  })
})
