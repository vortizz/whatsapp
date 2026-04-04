import { defineStore } from 'pinia'

export const useMessageSelectionStore = defineStore('messageSelection', () => {
    const isSelecting = ref(false)
    const selectedIds = ref<string[]>([])

    function enterSelectionMode(id: string) {
        isSelecting.value = true
        selectedIds.value = [id]
    }

    function toggleSelection(id: string) {
        const idx = selectedIds.value.indexOf(id)
        if (idx === -1) selectedIds.value.push(id)
        else selectedIds.value.splice(idx, 1)
    }

    function cancelSelection() {
        isSelecting.value = false
        selectedIds.value = []
    }

    return { isSelecting, selectedIds, enterSelectionMode, toggleSelection, cancelSelection }
})
