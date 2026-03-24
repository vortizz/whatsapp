export function useClearChatState() {
    const clearingChatId = useState('clearing-chat-id', () => '')
    const clearedChatState = useState('cleared-chat-state', () => ({
        chatId: '',
        nonce: 0
    }))
    const selectedChatHasMessages = useState('selected-chat-has-messages', () => false)

    return {
        clearingChatId,
        clearedChatState,
        selectedChatHasMessages
    }
}
