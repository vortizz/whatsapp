export function useDeleteMessageState() {
  const deletedMessageState = useState('deleted-message-state', () => ({
    chatId: '',
    lastMessage: null,
    nonce: 0,
  }))

  return { deletedMessageState }
}
