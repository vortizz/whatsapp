export function useSearchMembersModal() {
  const isOpen = useState('search-members-modal-open', () => false)
  const pendingViewMember = useState<any>('search-members-pending-view', () => null)
  const pendingMessageMember = useState<any>('search-members-pending-message', () => null)

  function openModal() {
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
  }

  function viewMember(member: any) {
    isOpen.value = false
    pendingViewMember.value = { ...member, _ts: Date.now() }
  }

  function messageMember(member: any) {
    isOpen.value = false
    pendingMessageMember.value = { ...member, _ts: Date.now() }
  }

  return {
    isOpen,
    pendingViewMember,
    pendingMessageMember,
    openModal,
    closeModal,
    viewMember,
    messageMember,
  }
}
