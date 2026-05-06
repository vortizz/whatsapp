<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
      aria-label="forward-message-modal"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-[436px] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col overflow-hidden"
        style="max-height: 85vh"
      >
        <!-- Header -->
        <div class="flex items-center gap-1 px-2.5 pt-3 pb-2">
          <button
            aria-label="close-forward-modal"
            class="p-2 rounded-full text-neutral-500 hover:bg-stone-400/10 dark:text-white/70 dark:hover:bg-white/5 text-2xl flex items-center"
            @click="closeModal"
          >
            <Icon name="mdi:close" />
          </button>
          <span class="text-base font-medium text-neutral-950 dark:text-white"
            >Forward message to</span
          >
        </div>

        <!-- Search -->
        <div class="px-4 pb-5">
          <div
            class="flex items-center gap-2 bg-gray-100 dark:bg-neutral-700 rounded-full px-3.5 py-3 focus-within:ring-2 focus-within:ring-emerald-500"
          >
            <Icon name="mdi:magnify" class="text-gray-400 dark:text-white/50 text-lg flex-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Search name or number"
              class="flex-1 bg-transparent text-sm text-neutral-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto px-2.5">
          <div v-if="loading" class="text-center py-16 text-sm text-black/50 dark:text-white/50">
            Looking for users
          </div>
          <template v-else-if="filteredUsers.length">
            <div class="px-4 pb-2 text-sm text-black/40 dark:text-white/40">Recent chats</div>
            <button
              v-for="user in filteredUsers"
              :key="user._id"
              :aria-label="`forward-to-${user.name}`"
              class="w-full rounded-xl flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-400/10 dark:hover:bg-white/5"
              @click="toggleUser(user._id)"
            >
              <div
                class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                :class="
                  selectedUserIds.includes(user._id)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-400 dark:border-gray-500'
                "
              >
                <Icon
                  v-if="selectedUserIds.includes(user._id)"
                  name="mdi:check"
                  class="text-white text-sm"
                />
              </div>
              <AvatarPlaceholder :size="49" :name="user.name" />
              <div class="flex-1 text-left min-w-0">
                <div class="text-base font-medium text-neutral-950 dark:text-white truncate">
                  {{ user.name }}
                </div>
                <div class="text-sm text-black/50 dark:text-white/50 truncate">
                  {{ user.about }}
                </div>
              </div>
            </button>
          </template>
          <div v-else class="text-center py-16 text-sm text-black/50 dark:text-white/50">
            No users found
          </div>
        </div>

        <!-- Bottom bar -->
        <div
          v-if="selectedUserIds.length > 0"
          class="flex items-center justify-between px-4 py-3 bg-stone-100 dark:bg-neutral-800 gap-3"
        >
          <span class="text-base text-neutral-950 dark:text-white truncate">{{
            selectedNames
          }}</span>
          <button
            aria-label="forward-send-btn"
            :disabled="forwarding"
            class="shrink-0 p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-neutral-950 text-xl flex items-center disabled:opacity-50 transition-colors"
            @click="forward"
          >
            <Icon name="mdi:send" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { useChatStore } from '../../store/chat'
  import { useUserStore } from '../../store/user'

  const { isOpen, messages, closeModal } = useForwardMessageModal()
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const crypto = useCrypto()
  const indexedDB = useIndexedDB()

  const search = ref('')
  const loading = ref(false)
  const forwarding = ref(false)
  const users = ref([])
  const selectedUserIds = ref([])

  const selectedNames = computed(() =>
    users.value
      .filter((u) => selectedUserIds.value.includes(u._id))
      .map((u) => u.name)
      .join(',  '),
  )

  const filteredUsers = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return users.value
    return users.value.filter((u) => u.name.toLowerCase().includes(q))
  })

  async function loadUsers() {
    try {
      loading.value = true
      const result = await useMyAuthFetch('user/new-chat', { method: 'GET' })
      users.value = result.map((u) => ({
        _id: u._id,
        name: u.name,
        about: u.about,
        email: u.email,
        isConnected: u.isConnected,
        lastSeenAt: u.lastSeenAt,
        publicKey: u.publicKey,
        chat: u.chat,
      }))
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      loading.value = false
    }
  }

  function toggleUser(id) {
    const idx = selectedUserIds.value.indexOf(id)
    if (idx === -1) selectedUserIds.value.push(id)
    else selectedUserIds.value.splice(idx, 1)
  }

  async function forward() {
    try {
      forwarding.value = true
      const targets = users.value.filter((u) => selectedUserIds.value.includes(u._id))
      let lastChat = null
      let lastUser = null
      const privateKey = await indexedDB.getKey(userStore._id, 'privateKey')
      for (const user of targets) {
        let chat = user.chat
        if (!chat) {
          const encryptedKeys = await crypto.generateSharedKeys([
            { userId: userStore._id, publicKeyBase64: userStore.publicKey },
            { userId: user._id, publicKeyBase64: user.publicKey },
          ])
          chat = await useMyAuthFetch('chat', {
            method: 'POST',
            body: { user_id: user._id, encryptedKeys },
          })
        }
        const encryptedAESKey = chat.encryptedKeys?.find(
          (k) => k.userId === userStore._id,
        )?.encryptedKey
        for (const msg of messages.value) {
          const { ciphertext, iv } = await crypto.encryptMessage(
            msg.text,
            encryptedAESKey,
            privateKey,
          )
          await useMyAuthFetch('message', {
            method: 'POST',
            body: { chat: chat._id, to: user._id, text: ciphertext, iv, forwarded: true },
          })
        }
        lastChat = chat
        lastUser = user
      }
      closeModal()
      if (lastChat && lastUser) {
        chatStore.setChat({
          _id: lastChat._id,
          users: [
            {
              _id: userStore._id,
              name: userStore.name,
              email: userStore.email,
              about: userStore.about,
              isConnected: userStore.isConnected,
              lastSeenAt: userStore.lastSeenAt,
            },
            {
              _id: lastUser._id,
              name: lastUser.name,
              email: lastUser.email,
              about: lastUser.about,
              isConnected: lastUser.isConnected,
              lastSeenAt: lastUser.lastSeenAt,
            },
          ],
          encryptedKeys: lastChat.encryptedKeys,
        })
      }
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      forwarding.value = false
    }
  }

  watch(isOpen, (val) => {
    if (val) {
      search.value = ''
      selectedUserIds.value = []
      loadUsers()
    }
  })
</script>
