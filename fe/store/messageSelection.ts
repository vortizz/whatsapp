import { defineStore } from 'pinia'

export const useMessageSelectionStore = defineStore('messageSelection', () => {
    const isSelecting = ref(false)
    const mode = ref<'delete' | 'forward'>('delete')
    const selectedIds = ref<string[]>([])

    function enterSelectionMode(id: string) {
        isSelecting.value = true
        mode.value = 'delete'
        selectedIds.value = [id]
    }

    function enterForwardMode(id: string) {
        isSelecting.value = true
        mode.value = 'forward'
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
        mode.value = 'delete'
    }

    return { isSelecting, mode, selectedIds, enterSelectionMode, enterForwardMode, toggleSelection, cancelSelection }
})
