<template>
  <aside
    aria-label="new-group-sidebar"
    class="flex-1 min-w-80 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-black/80 flex flex-col"
  >
    <header class="sticky top-0 z-10">
      <HomeNewGroupHeader :step="step" @close="handleClose" />
    </header>
    <main
      class="flex flex-col flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      <!-- Step 1: Select members -->
      <template v-if="step === 1">
        <HomeNewGroupMembers
          :selected="selectedUsers"
          @select="(u) => selectedUsers.push(u)"
          @deselect="(u) => (selectedUsers = selectedUsers.filter((s) => s._id !== u._id))"
        />
      </template>

      <!-- Step 2: Name the group -->
      <template v-else>
        <HomeNewGroupNameGroup :selected-users="selectedUsers" @created="onCreated" />
      </template>
    </main>

    <!-- Next button (step 1) -->
    <div v-if="step === 1 && selectedUsers.length > 0" class="flex justify-center pb-6 pt-2">
      <button
        aria-label="selected-users"
        class="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-md hover:bg-emerald-600 transition-colors"
        @click="step = 2"
      >
        <Icon name="material-symbols:arrow-forward-rounded" />
      </button>
    </div>
  </aside>
</template>

<script setup>
  import { useChatStore } from '../../../store/chat'

  const emit = defineEmits(['close'])
  const chatStore = useChatStore()

  const step = ref(1)
  const selectedUsers = ref([])

  function handleClose() {
    if (step.value === 2) {
      step.value = 1
    } else {
      emit('close')
    }
  }

  function onCreated(chat) {
    chatStore.setChat({
      _id: chat._id,
      users: chat.users,
      name: chat.name,
      isGroup: true,
      createdAt: chat.createdAt,
      createdBy: chat.createdBy,
      groupAdmins: chat.groupAdmins,
      encryptedKeys: chat.encryptedKeys,
      description: chat.description,
    })
    emit('close')
  }
</script>
