<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5"
            @click.self="closeModal"
        >
            <div class="w-full max-w-lg rounded-2xl bg-white py-5 px-6 shadow-2xl dark:bg-neutral-800">
                <div class="text-xl mb-5 font-semibold text-neutral-950 dark:text-white">
                    {{ selectedIds.length === 1 ? 'Delete message?' : 'Delete messages?' }}
                </div>
                <div class="mt-[70px] flex justify-end gap-2">
                    <button
                        class="text-sm font-semibold px-4 py-2.5 rounded-full text-emerald-700 dark:text-emerald-500 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors"
                        @click="closeModal"
                    >
                        Cancel
                    </button>
                    <button
                        class="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
                        @click="confirm"
                    >
                        Delete for me
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useMessageSelectionStore } from '../../store/messageSelection'

const { isOpen, closeModal, confirm } = useDeleteMessageModal()
const { selectedIds } = storeToRefs(useMessageSelectionStore())
</script>
