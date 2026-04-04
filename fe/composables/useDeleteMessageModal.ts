export function useDeleteMessageModal() {
    const isOpen = useState('delete-message-modal-open', () => false)
    const onConfirmCallback = useState<(() => void) | null>('delete-message-modal-callback', () => null)

    function openModal(onConfirm: () => void) {
        onConfirmCallback.value = onConfirm
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
        onConfirmCallback.value = null
    }

    function confirm() {
        onConfirmCallback.value?.()
        closeModal()
    }

    return { isOpen, openModal, closeModal, confirm }
}
