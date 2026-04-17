<template>
  <div class="flex flex-col items-center px-8 pt-8 pb-4 gap-4">
    <!-- Avatar -->
    <GroupAvatarPlaceholder :size="128" :users="chatUser.users" />

    <!-- Name + edit -->
    <div class="flex items-center gap-2 w-full">
      <div class="size-10" />
      <template v-if="editing">
        <input
          ref="nameInput"
          v-model="editedName"
          class="text-2xl font-semibold text-neutral-950 dark:text-white bg-transparent outline-none text-center flex-1 flex justify-center min-w-0"
          @keydown.enter="saveName"
          @keydown.esc="cancelEdit"
        />
        <button
          class="p-2 text-neutral-950 dark:text-white hover:bg-stone-200 dark:hover:bg-white/10 transition-colors flex items-center rounded-full"
          @click="saveName"
        >
          <Icon name="material-symbols:check-rounded" class="text-2xl" />
        </button>
      </template>
      <template v-else>
        <span
          class="text-2xl font-semibold text-neutral-950 dark:text-white text-center flex-1 flex justify-center"
          >{{ chatUser.name }}</span
        >
        <button
          v-if="isGroupAdmin(userId)"
          class="p-2 text-neutral-950 dark:text-white transition-colors flex items-center rounded-full dark:hover:bg-white/10 hover:bg-stone-200"
          @click="startEdit"
        >
          <Icon name="material-symbols:edit-outline-rounded" class="text-2xl" />
        </button>
        <CustomTooltip v-else text="only admin can edit this group's info">
          <div class="p-2 flex items-center">
            <Icon
              name="material-symbols:info-outline"
              class="text-2xl text-black/50 dark:text-white/50"
            />
          </div>
        </CustomTooltip>
      </template>
    </div>

    <!-- Subtitle -->
    <div class="text-base text-black/60 dark:text-white/50">
      <span>Group</span> · {{ chatUser.users?.length ?? 0 }} members
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 w-full mt-1">
      <button
        v-if="isGroupAdmin(userId)"
        class="flex-1 flex flex-col items-center gap-1.5 pt-3 pb-2 rounded-xl bg-transparent hover:bg-stone-100 hover:dark:bg-white/5 transition-colors border border-black/20 dark:border-white/10"
        @click="emit('openAddMember')"
      >
        <Icon name="material-symbols:group-add-outline-rounded" class="text-2xl text-emerald-500" />
        <span class="text-sm text-neutral-950 dark:text-white">Add</span>
      </button>
      <button
        class="flex-1 flex flex-col items-center gap-1.5 pt-3 pb-2 rounded-xl bg-transparent hover:bg-stone-100 hover:dark:bg-white/5 transition-colors border border-black/20 dark:border-white/10"
        @click="emit('search')"
      >
        <Icon name="material-symbols:search" class="text-2xl text-emerald-500" />
        <span class="text-sm text-neutral-950 dark:text-white">Search</span>
      </button>
    </div>

    <!-- Description -->
    <div class="flex items-center gap-2 w-full">
      <template v-if="editingDescription">
        <input
          ref="descriptionInput"
          v-model="editedDescription"
          class="text-sm text-neutral-950 dark:text-white bg-transparent outline-none flex-1 min-w-0"
          @keydown.enter="saveDescription"
          @keydown.esc="cancelDescriptionEdit"
        />
        <button
          class="p-2 text-neutral-950 dark:text-white hover:bg-stone-200 dark:hover:bg-white/10 transition-colors flex items-center rounded-full"
          @click="saveDescription"
        >
          <Icon name="material-symbols:check-rounded" class="text-2xl" />
        </button>
      </template>
      <template v-else>
        <span
          class="flex-1"
          :class="
            chatUser.description || !isGroupAdmin(userId)
              ? 'text-neutral-950 dark:text-white'
              : 'text-emerald-500 cursor-pointer'
          "
          @click="chatUser.description || !isGroupAdmin(userId) ? null : startDescriptionEdit()"
        >
          {{
            isGroupAdmin(userId)
              ? chatUser.description || 'Add group description'
              : (chatUser.description ?? 'No description')
          }}
        </span>
        <button
          v-if="isGroupAdmin(userId)"
          class="p-2 text-neutral-950 dark:text-white transition-colors flex items-center rounded-full dark:hover:bg-white/10 hover:bg-stone-200"
          @click="startDescriptionEdit"
        >
          <Icon name="material-symbols:edit-outline-rounded" class="text-2xl" />
        </button>
        <CustomTooltip v-else text="only admin can edit this group's info">
          <div class="p-2 flex items-center">
            <Icon
              name="material-symbols:info-outline"
              class="text-2xl text-black/50 dark:text-white/50"
            />
          </div>
        </CustomTooltip>
      </template>
    </div>

    <!-- Created by -->
    <div v-if="createdAtLabel" class="w-full text-base text-black/60 dark:text-white/60 py-1">
      {{ createdAtLabel }}
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'
  import CustomTooltip from '~/components/CustomTooltip.vue'

  const emit = defineEmits(['openAddMember', 'search'])

  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { user: chatUser, _id: chatId } = storeToRefs(chatStore)
  const { _id: userId } = storeToRefs(userStore)

  const createdAtLabel = computed(() => {
    const createdAt = chatUser.value.createdAt
    const createdBy = chatUser.value.createdBy
    if (!createdAt) return null

    const date = new Date(createdAt)
    const now = new Date()
    const aWeekAgo = new Date(now)
    aWeekAgo.setDate(now.getDate() - 7)

    let dayPart
    if (date.toLocaleDateString('en-GB') === now.toLocaleDateString('en-GB')) {
      dayPart = 'today'
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      if (date.toLocaleDateString('en-GB') === yesterday.toLocaleDateString('en-GB')) {
        dayPart = 'yesterday'
      } else if (date >= aWeekAgo) {
        dayPart = date.toLocaleString(navigator.language, { weekday: 'long' })
      } else {
        dayPart = date.toLocaleDateString(navigator.language)
      }
    }

    const timePart = date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit',
    })

    const creatorId = createdBy?._id || createdBy
    const creatorName =
      creatorId === userId.value
        ? 'you'
        : (chatUser.value.users?.find((u) => (u._id || u) === creatorId)?.name ?? 'unknown')

    return `Group created by ${creatorName}, on ${dayPart} at ${timePart}`
  })

  const editing = ref(false)
  const editedName = ref('')
  const nameInput = ref(null)

  const groupAdminIds = computed(
    () =>
      new Set(
        (chatUser.value?.groupAdmins ?? []).map((a) =>
          typeof a === 'object' && a !== null ? a._id?.toString() : a?.toString(),
        ),
      ),
  )

  function isGroupAdmin(memberId) {
    return groupAdminIds.value.has(memberId?.toString())
  }

  function startEdit() {
    editedName.value = chatUser.value.name
    editing.value = true
    nextTick(() => nameInput.value?.focus())
  }

  function cancelEdit() {
    editing.value = false
  }

  async function saveName() {
    const trimmed = editedName.value.trim()
    if (!trimmed || trimmed === chatUser.value.name) {
      cancelEdit()
      return
    }
    await useMyAuthFetch(`/chat/${chatId.value}/name`, {
      method: 'PATCH',
      body: { name: trimmed },
    })
    chatUser.value.name = trimmed
    editing.value = false
  }

  const editingDescription = ref(false)
  const editedDescription = ref('')
  const descriptionInput = ref(null)

  function startDescriptionEdit() {
    editedDescription.value = chatUser.value.description || ''
    editingDescription.value = true
    nextTick(() => descriptionInput.value?.focus())
  }

  function cancelDescriptionEdit() {
    editingDescription.value = false
  }

  async function saveDescription() {
    const trimmed = editedDescription.value.trim()
    if (trimmed === (chatUser.value.description || '')) {
      cancelDescriptionEdit()
      return
    }
    await useMyAuthFetch(`/chat/${chatId.value}/description`, {
      method: 'PATCH',
      body: { description: trimmed },
    })
    chatUser.value.description = trimmed
    editingDescription.value = false
  }
</script>
