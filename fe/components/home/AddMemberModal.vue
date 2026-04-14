<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
            @click.self="closeModal"
        >
            <div class="w-full max-w-[436px] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col overflow-hidden" style="max-height: 85vh">
                <!-- Header -->
                <div class="flex items-center gap-1 px-2.5 pt-3 pb-2">
                    <button @click="closeModal" class="p-2 rounded-full text-neutral-500 hover:bg-stone-400/10 dark:text-white/70 dark:hover:bg-white/5 text-2xl flex items-center">
                        <Icon name="mdi:close" />
                    </button>
                    <span class="text-base font-medium text-neutral-950 dark:text-white">Add member</span>
                </div>

                <!-- Search + chips -->
                <div class="px-4 pb-3">
                    <!-- Selected chips -->
                    <div v-if="selected.length" class="flex flex-wrap gap-1.5 mb-3">
                        <div
                            v-for="u in selected"
                            :key="u._id"
                            class="flex items-center rounded-full px-2 py-1"
                        >
                            <AvatarPlaceholder :size="26" :name="u.name" />
                            <span class="text-base text-neutral-950 dark:text-white ml-2 mr-1.5">{{ u.name }}</span>
                            <button @click="deselect(u)" class="flex items-center p-0.5 text-black/60 dark:text-white/60 hover:bg-stone-400/20 rounded-full">
                                <Icon name="material-symbols:close" class="text-2xl" />
                            </button>
                        </div>
                    </div>

                    <!-- Search input -->
                    <div class="flex items-center gap-2 bg-gray-100 dark:bg-neutral-700 rounded-full px-3.5 py-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-transparent">
                        <Icon name="mdi:magnify" class="text-gray-400 dark:text-white/50 text-lg flex-none" />
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search name or number"
                            class="flex-1 bg-transparent text-sm text-neutral-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none"
                        />
                    </div>
                </div>

                <!-- User list -->
                <div class="flex-1 overflow-y-auto px-2.5 pb-4">
                    <div v-if="loading" class="text-center py-16 text-sm text-black/50 dark:text-white/50">
                        Looking for users
                    </div>
                    <div v-else-if="!groupedUsers.length" class="text-center py-16 text-sm text-black/50 dark:text-white/50">
                        No results found
                    </div>
                    <template v-else v-for="(group, i) in groupedUsers" :key="i">
                        <div class="capitalize pt-6 pb-3 pl-3 text-black/60 dark:text-white/60 text-sm">
                            {{ group.letter }}
                        </div>
                        <div
                            v-for="u in group.users"
                            :key="u._id"
                            class="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-stone-400/10 dark:hover:bg-white/5 cursor-pointer"
                            :class="isSelected(u) ? 'bg-stone-400/10 dark:bg-white/5' : ''"
                            @click="toggle(u)"
                        >
                            <div
                                class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                                :class="isSelected(u) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400 dark:border-gray-500'"
                            >
                                <Icon v-if="isSelected(u)" name="mdi:check" class="text-white dark:text-neutral-950 text-sm" />
                            </div>
                            <AvatarPlaceholder :size="48" :name="u.name" />
                            <div class="flex-1 min-w-0">
                                <div class="text-base text-neutral-950 dark:text-white truncate">{{ u.name }}</div>
                                <div class="text-sm text-black/50 dark:text-white/50 truncate">{{ u.about }}</div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Confirm button -->
                <div v-if="selected.length" class="flex justify-end px-4 pb-4">
                    <button
                        class="w-14 h-14 rounded-full bg-emerald-500 text-white dark:text-neutral-950 flex items-center justify-center text-2xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-60"
                        :disabled="saving"
                        @click="confirm"
                    >
                        <Icon name="material-symbols:check-rounded" />
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../store/chat'

const emit = defineEmits(['added'])

const { isOpen, closeModal, onMembersAdded } = useAddMemberModal()
const chatStore = useChatStore()
const { _id: chatId, user: chatUser } = storeToRefs(chatStore)

const search = ref('')
const allUsers = ref([])
const loading = ref(false)
const saving = ref(false)
const selected = ref([])

const debouncedSearch = debounce(() => getUsers(), 500)
watch(search, debouncedSearch)

async function getUsers() {
    try {
        loading.value = true
        const query = search.value ? { query: { username: search.value } } : {}
        const result = await useMyAuthFetch('user/new-chat', { method: 'GET', ...query })
        const existingIds = new Set((chatUser.value.users ?? []).map(u => u._id?.toString() ?? u.toString()))
        allUsers.value = result
            .filter(u => !existingIds.has(u._id))
            .map(u => ({ _id: u._id, name: u.name, about: u.about }))
    } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
    } finally {
        loading.value = false
    }
}

const groupedUsers = computed(() => {
    const list = allUsers.value
    const result = []
    const handled = new Set()
    for (const user of list) {
        if (handled.has(user._id)) continue
        const letter = user.name.trim().toUpperCase().charAt(0)
        const group = list.filter(u => u.name.trim().toUpperCase().charAt(0) === letter && !handled.has(u._id))
        result.push({ letter, users: group })
        group.forEach(u => handled.add(u._id))
    }
    return result
})

function isSelected(u) {
    return selected.value.some(s => s._id === u._id)
}

function toggle(u) {
    if (isSelected(u)) {
        deselect(u)
    } else {
        selected.value.push(u)
    }
}

function deselect(u) {
    selected.value = selected.value.filter(s => s._id !== u._id)
}

async function confirm() {
    try {
        saving.value = true
        const updatedChat = await useMyAuthFetch(`/chat/${chatId.value}/members`, {
            method: 'PATCH',
            body: { user_ids: selected.value.map(u => u._id) }
        })
        onMembersAdded(updatedChat)
        closeModal()
    } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
    } finally {
        saving.value = false
    }
}

watch(isOpen, (val) => {
    if (val) {
        search.value = ''
        allUsers.value = []
        loading.value = false
        saving.value = false
        selected.value = []
        getUsers()
    }
})
</script>
