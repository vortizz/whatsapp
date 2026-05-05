const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function useTypingState() {
  const typingChats = useState<Record<string, Record<string, { name: string }>>>(
    'typing-chats',
    () => ({}),
  )

  function setTyping(chatId: string, from: { _id: string; name: string }) {
    const chatTypers = typingChats.value[chatId] ?? {}
    typingChats.value = {
      ...typingChats.value,
      [chatId]: { ...chatTypers, [from._id]: { name: from.name } },
    }

    const key = `${chatId}:${from._id}`
    if (timers.has(key)) clearTimeout(timers.get(key)!)
    timers.set(
      key,
      setTimeout(() => {
        const next = { ...typingChats.value }
        if (next[chatId]) {
          const remaining = { ...next[chatId] }
          delete remaining[from._id]
          if (Object.keys(remaining).length === 0) {
            delete next[chatId]
          } else {
            next[chatId] = remaining
          }
        }
        typingChats.value = next
        timers.delete(key)
      }, 3000),
    )
  }

  function clearTyping(chatId: string, userId: string) {
    const key = `${chatId}:${userId}`
    if (timers.has(key)) {
      clearTimeout(timers.get(key)!)
      timers.delete(key)
    }
    const next = { ...typingChats.value }
    if (next[chatId]) {
      const remaining = { ...next[chatId] }
      delete remaining[userId]
      if (Object.keys(remaining).length === 0) {
        delete next[chatId]
      } else {
        next[chatId] = remaining
      }
      typingChats.value = next
    }
  }

  function isTypingInChat(chatId: string): boolean {
    return !!typingChats.value[chatId] && Object.keys(typingChats.value[chatId]).length > 0
  }

  function getTypingUsers(chatId: string): Array<{ _id: string; name: string }> {
    const chatTypers = typingChats.value[chatId]
    if (!chatTypers) return []
    return Object.entries(chatTypers).map(([_id, { name }]) => ({ _id, name }))
  }

  return { typingChats, setTyping, clearTyping, isTypingInChat, getTypingUsers }
}
