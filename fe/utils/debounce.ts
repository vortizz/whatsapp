export function debounce(func: any, timeout: number) {
    let timeoutId: string | number | NodeJS.Timeout | undefined
    return (...args: any) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
      }, timeout)
    }
}