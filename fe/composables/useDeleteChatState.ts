export function useDeleteChatState() {
    const deletingChatId = useState('deleting-chat-id', () => '')
    const deletedChatState = useState('deleted-chat-state', () => ({
        chatId: '',
        nonce: 0
    }))

    return {
        deletingChatId,
        deletedChatState
    }
}
