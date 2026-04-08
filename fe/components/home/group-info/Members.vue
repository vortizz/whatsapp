<template>
    <div class="flex flex-col">
        <!-- Members count header -->
        <div class="flex items-center justify-between px-6 py-3">
            <span class="text-sm text-black/60 dark:text-white/60 font-semibold">{{ members.length }} members</span>
            <button class="text-black/50 dark:text-white/50" @click="openSearchMembersModal">
                <Icon name="material-symbols:search" class="text-2xl" />
            </button>
        </div>

        <!-- Add member -->
        <div
            class="flex items-center gap-4 px-4 py-3 hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer mx-2.5 rounded-xl"
            @click="emit('openAddMember')"
        >
            <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white dark:text-neutral-950 text-xl flex-none">
                <Icon name="material-symbols:person-add-outline-rounded" />
            </div>
            <span class="text-base text-neutral-950 dark:text-white">Add member</span>
        </div>
        <!-- Member list -->
        <div
            v-for="member in members"
            :key="member._id"
            class="flex items-center gap-4 px-4 py-3 mx-2.5 rounded-xl group relative"
            :class="member._id?.toString() !== userId ? 'cursor-pointer hover:bg-stone-100 dark:hover:bg-white/5' : ''"
            @click="member._id?.toString() !== userId && emit('viewMember', member)"
            @contextmenu.prevent="member._id?.toString() !== userId && toggleMenu(member._id)"
        >
            <AvatarPlaceholder :size="48" class="flex-none" />
            <div class="flex-1 min-w-0">
                <div class="flex justify-between">
                    <div class="text-base text-neutral-950 dark:text-white truncate">
                        {{ member._id?.toString() === userId ? 'You' : member.name }}
                    </div>
                    <div
                        v-if="isGroupAdmin(member._id)" 
                        class="text-[11px] py-[1px] px-1 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-100 flex items-center text-nowrap"
                    >
                        Group admin
                    </div>
                </div>
                <div v-if="member._id?.toString() !== userId" class="flex">
                    <div class="text-sm text-black/50 dark:text-white/50 truncate">{{ member.about }}</div>
                    <button @click.stop="toggleMenu(member._id)" class="invisible group-hover:visible text-xl">
                        <Icon name="mdi:chevron-down" />
                    </button>
                </div>
            </div>
            <HomeGroupInfoMembersMenu
                :_id="member._id"
                :isAdmin="isGroupAdmin(member._id)"
                :isMenuOpen="isMenuOpen === member._id"
                @toggle-menu="toggleMenu(member._id)"
                @make-group-admin="makeGroupAdmin"
                @dismiss-group-admin="dismissGroupAdmin"
                @remove="removeMember"
            />
        </div>

        <button class="flex items-center gap-4 px-5 py-5 hover:bg-stone-100 dark:hover:bg-white/5 text-rose-600 dark:text-rose-400 transition-colors mx-2.5 rounded-xl" @click="openClearChatModal()">
            <Icon name="zondicons:minus-outline" class="text-2xl pl-10" />
            <span class="text-base">Clear chat</span>
        </button>
        <button class="flex items-center gap-4 px-5 py-5 hover:bg-stone-100 dark:hover:bg-white/5 text-rose-600 dark:text-rose-400 transition-colors mx-2.5 rounded-xl" @click="openExitGroupModal">
            <Icon name="material-symbols:logout-rounded" class="text-2xl pl-10" />
            <span class="text-base">Exit group</span>
        </button>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'

const emit = defineEmits(['openAddMember', 'viewMember'])

const chatStore = useChatStore()
const userStore = useUserStore()
const { _id: chatId, user: chatUser } = storeToRefs(chatStore)
const { _id: userId } = storeToRefs(userStore)

const { openModal: openSearchMembersModal } = useSearchMembersModal()
const { openModal: openMakeGroupAdminModal } = useMakeGroupAdminModal()
const { openModal: openRemoveMemberModal } = useRemoveMemberModal()
const { openModal: openExitGroupModal } = useExitGroupModal()
const { openModal: openClearChatModal } = useClearChatModal()

const isMenuOpen = ref(null)

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

function toggleMenu(id) {
  isMenuOpen.value = isMenuOpen.value === id ? null : id
}

function makeGroupAdmin(memberId) {
  const member = members.value.find(m => m._id === memberId)
  if (member) openMakeGroupAdminModal(member, false)
}

function removeMember(memberId) {
  const member = members.value.find(m => m._id === memberId)
  if (member) openRemoveMemberModal(member)
}

async function dismissGroupAdmin(memberId) {
  try {
    const updated = await useMyAuthFetch(`chat/${chatId.value}/group-admin/${memberId}`, {
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
</script>
