import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../../utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not call the function immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the function after the timeout', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should only call the function once when called multiple times rapidly', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset the timer when called again before timeout', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200) // almost there but not yet
    debounced() // reset the timer
    vi.advanceTimersByTime(200) // still not 300ms since last call

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100) // now 300ms since last call
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call the function with the latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('first')
    debounced('second')
    debounced('third')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledWith('third')
  })
})
