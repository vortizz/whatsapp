export function useForwardMessageModal() {
    const isOpen = useState('forward-message-modal-open', () => false)
    const messages = useState<{ _id: string; text: string }[]>('forward-message-modal-messages', () => [])

    function openModal(msgs: { _id: string; text: string }[]) {
        messages.value = msgs
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
        messages.value = []
    }

    return { isOpen, messages, openModal, closeModal }
}
