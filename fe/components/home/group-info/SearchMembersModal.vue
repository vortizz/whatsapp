<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
            @click.self="closeModal"
        >
            <div class="w-full max-w-[436px] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col" style="max-height: 85vh">
                <!-- Header -->
                <div class="flex items-center gap-1 px-2.5 pt-3 pb-2">
                    <button @click="closeModal" class="p-2 rounded-full text-neutral-500 hover:bg-stone-400/10 dark:text-white/70 dark:hover:bg-white/5 text-2xl flex items-center">
                        <Icon name="mdi:close" />
                    </button>
                    <span class="text-base font-medium text-neutral-950 dark:text-white">Search members</span>
                </div>

                <!-- Search input -->
                <div class="px-4 pb-3">
                    <div class="flex items-center gap-2 bg-gray-100 dark:bg-neutral-700 rounded-full px-3.5 py-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-transparent">
                        <Icon name="mdi:magnify" class="text-gray-400 dark:text-white/50 text-lg flex-none" />
                        <input
                            ref="inputRef"
                            v-model="search"
                            type="text"
                            placeholder="Search members"
                            class="flex-1 bg-transparent text-sm text-neutral-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none"
                        />
                    </div>
                </div>

                <!-- Member list -->
                <div class="flex-1 overflow-y-auto px-2.5 pb-4">
                    <div v-if="!filteredMembers.length" class="text-center py-16 text-sm text-black/50 dark:text-white/50">
                        No members found
                    </div>
                    <div
                        v-for="member in filteredMembers"
                        :key="member._id"
                        class="relative"
                    >
                        <div
                            class="flex items-center gap-4 px-3.5 py-3 rounded-xl"
                            :class="member._id?.toString() === userId ? 'cursor-default' : 'cursor-pointer hover:bg-stone-400/10 dark:hover:bg-white/5'"
                            @click.stop="member._id?.toString() !== userId && toggleMenu(member._id, $event)"
                        >
                            <AvatarPlaceholder :size="48" class="flex-none" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                    <div class="text-base text-neutral-950 dark:text-white truncate">
                                        {{ member._id?.toString() === userId ? 'You' : member.name }}
                                    </div>
                                    <div 
                                        v-if="isGroupAdmin(member._id)"
                                        class="text-[11px] py-[1px] px-1 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-100 flex-none text-nowrap"
                                    >
                                        Group admin
                                    </div>
                                </div>
                                <div class="text-sm text-black/50 dark:text-white/50 truncate">{{ member.about }}</div>
                            </div>
                        </div>

                        <!-- Dropdown menu -->
                        <transition
                            enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                        >
                            <div
                                v-if="activeMenu === member._id"
                                class="fixed z-[60] w-52 rounded-xl bg-white shadow-lg ring-1 ring-black/10 dark:bg-neutral-800 dark:ring-white/10 p-1"
                                :style="menuStyle"
                                :ref="el => setMenuRef(member._id, el)"
                            >
                                <button
                                    v-if="!isGroupAdmin(member._id)"
                                    @click.stop="handleMakeAdmin(member)"
                                    class="text-black/60 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-2 rounded-xl dark:text-zinc-50 text-sm"
                                >
                                    <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>person-shield-check</title><path fill-rule="evenodd" clip-rule="evenodd" d="M6.175 10.825C6.95833 11.6083 7.9 12 9 12C10.1 12 11.0417 11.6083 11.825 10.825C12.6083 10.0417 13 9.1 13 8C13 6.9 12.6083 5.95833 11.825 5.175C11.0417 4.39167 10.1 4 9 4C7.9 4 6.95833 4.39167 6.175 5.175C5.39167 5.95833 5 6.9 5 8C5 9.1 5.39167 10.0417 6.175 10.825ZM1 17.2V18C1 18.55 1.19583 19.0208 1.5875 19.4125C1.97917 19.8042 2.45 20 3 20H9.5C9.78333 20 10.0208 19.9042 10.2125 19.7125C10.4042 19.5208 10.5 19.2833 10.5 19C10.5 18.7167 10.4042 18.4792 10.2125 18.2875C10.0208 18.0958 9.78333 18 9.5 18H3V17.2C3 17.0167 3.04167 16.85 3.125 16.7C3.20833 16.55 3.33333 16.4333 3.5 16.35C4.33333 15.9333 5.1875 15.6083 6.0625 15.375C6.9375 15.1417 7.84167 15.025 8.775 15.025C9.05833 15.025 9.29583 14.9292 9.4875 14.7375C9.67917 14.5458 9.775 14.3083 9.775 14.025C9.775 13.7417 9.67917 13.5 9.4875 13.3C9.29583 13.1 9.05833 13 8.775 13C7.69167 13 6.63333 13.1375 5.6 13.4125C4.56667 13.6875 3.56667 14.0667 2.6 14.55C2.1 14.8 1.70833 15.1667 1.425 15.65C1.14167 16.1333 1 16.65 1 17.2ZM10.4125 9.4125C10.0208 9.80417 9.55 10 9 10C8.45 10 7.97917 9.80417 7.5875 9.4125C7.19583 9.02083 7 8.55 7 8C7 7.45 7.19583 6.97917 7.5875 6.5875C7.97917 6.19583 8.45 6 9 6C9.55 6 10.0208 6.19583 10.4125 6.5875C10.8042 6.97917 11 7.45 11 8C11 8.55 10.8042 9.02083 10.4125 9.4125ZM17 22C16.9271 22 16.8594 21.9949 16.7969 21.9848C16.7344 21.9747 16.6719 21.9596 16.6094 21.9394C15.2031 21.4848 14.0833 20.6439 13.25 19.4167C12.4167 18.1894 12 16.8687 12 15.4545V13.5606C12 13.3081 12.0755 13.0808 12.2266 12.8788C12.3776 12.6768 12.5729 12.5303 12.8125 12.4394L16.5625 11.0758C16.7083 11.0253 16.8542 11 17 11C17.1458 11 17.2917 11.0253 17.4375 11.0758L21.1875 12.4394C21.4271 12.5303 21.6224 12.6768 21.7734 12.8788C21.9245 13.0808 22 13.3081 22 13.5606V15.4545C22 16.8687 21.5833 18.1894 20.75 19.4167C19.9167 20.6439 18.7969 21.4848 17.3906 21.9394C17.3281 21.9596 17.2656 21.9747 17.2031 21.9848C17.1406 21.9949 17.0729 22 17 22ZM16.1844 16.5452L18.5057 14.224C18.655 14.0747 18.845 14 19.0758 14C19.3066 14 19.4966 14.0747 19.6459 14.224C19.7952 14.3733 19.8699 14.5633 19.8699 14.7941C19.8699 15.0249 19.7952 15.2149 19.6459 15.3643L16.7545 18.2557C16.5916 18.4186 16.4016 18.5 16.1844 18.5C15.9672 18.5 15.7771 18.4186 15.6143 18.2557L14.474 17.1154C14.3247 16.9661 14.25 16.776 14.25 16.5452C14.25 16.3145 14.3247 16.1244 14.474 15.9751C14.6233 15.8258 14.8133 15.7511 15.0441 15.7511C15.2749 15.7511 15.4649 15.8258 15.6143 15.9751L16.1844 16.5452Z" fill="currentColor"></path></svg>
                                    Make group admin
                                </button>
                                <button
                                    v-else
                                    @click.stop="handleDismissAdmin(member)"
                                    class="text-black/60 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-2 rounded-xl dark:text-zinc-50 text-sm"
                                >
                                    <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>person-shield-remove</title><path fill-rule="evenodd" clip-rule="evenodd" d="M6.175 10.825C6.95833 11.6083 7.9 12 9 12C10.1 12 11.0417 11.6083 11.825 10.825C12.6083 10.0417 13 9.1 13 8C13 6.9 12.6083 5.95833 11.825 5.175C11.0417 4.39167 10.1 4 9 4C7.9 4 6.95833 4.39167 6.175 5.175C5.39167 5.95833 5 6.9 5 8C5 9.1 5.39167 10.0417 6.175 10.825ZM1 17.2V18C1 18.55 1.19583 19.0208 1.5875 19.4125C1.97917 19.8042 2.45 20 3 20H9.5C9.78333 20 10.0208 19.9042 10.2125 19.7125C10.4042 19.5208 10.5 19.2833 10.5 19C10.5 18.7167 10.4042 18.4792 10.2125 18.2875C10.0208 18.0958 9.78333 18 9.5 18H3V17.2C3 17.0167 3.04167 16.85 3.125 16.7C3.20833 16.55 3.33333 16.4333 3.5 16.35C4.33333 15.9333 5.1875 15.6083 6.0625 15.375C6.9375 15.1417 7.84167 15.025 8.775 15.025C9.05833 15.025 9.29583 14.9292 9.4875 14.7375C9.67917 14.5458 9.775 14.3083 9.775 14.025C9.775 13.7417 9.67917 13.5 9.4875 13.3C9.29583 13.1 9.05833 13 8.775 13C7.69167 13 6.63333 13.1375 5.6 13.4125C4.56667 13.6875 3.56667 14.0667 2.6 14.55C2.1 14.8 1.70833 15.1667 1.425 15.65C1.14167 16.1333 1 16.65 1 17.2ZM10.4125 9.4125C10.0208 9.80417 9.55 10 9 10C8.45 10 7.97917 9.80417 7.5875 9.4125C7.19583 9.02083 7 8.55 7 8C7 7.45 7.19583 6.97917 7.5875 6.5875C7.97917 6.19583 8.45 6 9 6C9.55 6 10.0208 6.19583 10.4125 6.5875C10.8042 6.97917 11 7.45 11 8C11 8.55 10.8042 9.02083 10.4125 9.4125ZM17 22C16.9271 22 16.8594 21.9949 16.7969 21.9848C16.7344 21.9747 16.6719 21.9596 16.6094 21.9394C15.2031 21.4848 14.0833 20.6439 13.25 19.4167C12.4167 18.1894 12 16.8687 12 15.4545V13.5606C12 13.3081 12.0755 13.0808 12.2266 12.8788C12.3776 12.6768 12.5729 12.5303 12.8125 12.4394L16.5625 11.0758C16.7083 11.0253 16.8542 11 17 11C17.1458 11 17.2917 11.0253 17.4375 11.0758L21.1875 12.4394C21.4271 12.5303 21.6224 12.6768 21.7734 12.8788C21.9245 13.0808 22 13.3081 22 13.5606V15.4545C22 16.8687 21.5833 18.1894 20.75 19.4167C19.9167 20.6439 18.7969 21.4848 17.3906 21.9394C17.3281 21.9596 17.2656 21.9747 17.2031 21.9848C17.1406 21.9949 17.0729 22 17 22ZM14 16C14 15.5858 14.3358 15.25 14.75 15.25H19.25C19.6642 15.25 20 15.5858 20 16C20 16.4142 19.6642 16.75 19.25 16.75H14.75C14.3358 16.75 14 16.4142 14 16Z" fill="currentColor"></path></svg>
                                    Dismiss as admin
                                </button>
                                <button
                                    @click.stop="handleRemove(member)"
                                    class="text-black/60 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm"
                                >
                                    <Icon name="zondicons:minus-outline" class="text-xl flex-none" />
                                    Remove
                                </button>
                                <button
                                    @click.stop="handleViewMember(member)"
                                    class="text-black/60 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm"
                                >
                                    <Icon name="mdi:account-outline" class="text-xl flex-none" />
                                    Contact info
                                </button>
                                <button
                                    @click.stop="handleMessage(member)"
                                    class="text-black/60 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm"
                                >
                                    <Icon name="mdi:message-outline" class="text-xl flex-none" />
                                    Message {{ member.name }}
                                </button>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'

const { isOpen, closeModal, viewMember, messageMember } = useSearchMembersModal()
const { openModal: openMakeGroupAdminModal } = useMakeGroupAdminModal()
const { openModal: openRemoveMemberModal } = useRemoveMemberModal()

const chatStore = useChatStore()
const userStore = useUserStore()
const { _id: chatId, user: chatUser } = storeToRefs(chatStore)
const { _id: userId } = storeToRefs(userStore)

const search = ref('')
const inputRef = ref(null)
const activeMenu = ref(null)
const menuStyle = ref({})
const menuRefs = ref({})

const members = computed(() => {
    const users = chatUser.value?.users ?? []
    return [...users].sort((a, b) => {
        if (a._id?.toString() === userId.value) return -1
        if (b._id?.toString() === userId.value) return 1
        return 0
    })
})
const groupAdminIds = computed(() =>
    new Set((chatUser.value?.groupAdmins ?? []).map(a =>
        typeof a === 'object' && a !== null ? a._id?.toString() : a?.toString()
    ))
)

function isGroupAdmin(memberId) {
    return groupAdminIds.value.has(memberId?.toString())
}

const filteredMembers = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return members.value
    return members.value.filter(m => m.name?.toLowerCase().includes(q))
})

function setMenuRef(id, el) {
    if (el) menuRefs.value[id] = el
    else delete menuRefs.value[id]
}

function toggleMenu(id, event) {
    if (activeMenu.value === id) {
        activeMenu.value = null
        return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow >= 180) {
        menuStyle.value = { top: rect.bottom + 4 + 'px', left: rect.left + 14 + 'px' }
    } else {
        menuStyle.value = { bottom: window.innerHeight - rect.top + 4 + 'px', left: rect.left + 14 + 'px' }
    }
    activeMenu.value = id
}

function handleClickOutside(e) {
    if (!activeMenu.value) return
    const menuEl = menuRefs.value[activeMenu.value]
    if (menuEl && !menuEl.contains(e.target)) {
        activeMenu.value = null
    }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function handleMakeAdmin(member) {
    activeMenu.value = null
    closeModal()
    openMakeGroupAdminModal(member, false)
}

async function handleDismissAdmin(member) {
    activeMenu.value = null
    try {
        const updated = await useMyAuthFetch(`chat/${chatId.value}/group-admin/${member._id}`, {
            method: 'PATCH',
            body: { is_admin: false },
        })
        chatStore.$patch(state => { state.user.groupAdmins = updated.groupAdmins })
    } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
    }
}

function handleRemove(member) {
    activeMenu.value = null
    closeModal()
    openRemoveMemberModal(member)
}

function handleViewMember(member) {
    activeMenu.value = null
    viewMember(member)
}

function handleMessage(member) {
    activeMenu.value = null
    messageMember(member)
}

watch(isOpen, (val) => {
    if (val) {
        search.value = ''
        activeMenu.value = null
        nextTick(() => inputRef.value?.focus())
    }
})
</script>
