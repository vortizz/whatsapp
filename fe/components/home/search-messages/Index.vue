<template>
  <aside
    class="flex-1 min-w-80 bg-white dark:bg-neutral-900 flex flex-col border-l border-gray-200 dark:border-white/10"
  >
    <header class="px-4 py-2.5 flex flex-row items-center gap-2.5">
      <button
        class="text-2xl leading-6 p-2 rounded-full hover:bg-stone-100 text-neutral-950 dark:text-white flex items-center dark:hover:bg-white/5 transition-colors"
        @click="emit('close')"
      >
        <Icon name="material-symbols:close" />
      </button>
      <div class="text-neutral-950 dark:text-white text-base">Search messages</div>
    </header>

    <div class="px-4 py-2">
      <div
        class="flex items-center gap-2 rounded-full border border-emerald-500 px-3 py-1.5 bg-transparent"
      >
        <Icon name="material-symbols:search" class="text-xl text-gray-400 shrink-0" />
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          placeholder="Search"
          class="flex-1 bg-transparent outline-none text-sm text-neutral-950 dark:text-white placeholder:text-gray-400"
        />
        <button
          v-if="query"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center"
          @click="query = ''"
        >
          <Icon name="material-symbols:close" class="text-base" />
        </button>
      </div>
    </div>

    <main
      class="flex-1 overflow-y-auto px-2.5 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      <template v-if="!query">
        <div class="flex items-center justify-center h-full">
          <p class="text-sm text-gray-400 dark:text-gray-500 text-center px-6">
            Search for messages with {{ effectiveChatName }}.
          </p>
        </div>
      </template>
      <template v-else-if="results.length === 0">
        <div class="flex items-center justify-center h-full">
          <p class="text-sm text-gray-400 dark:text-gray-500">No results found.</p>
        </div>
      </template>
      <template v-else>
        <div
          v-for="msg in results"
          :key="msg._id"
          class="px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 cursor-pointer"
          @click="emit('goToMessage', msg._id)"
        >
          <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">
            {{ formatDate(msg.createdAt) }}
          </div>
          <div class="flex items-center gap-1.5 text-sm text-neutral-950 dark:text-white">
            <span v-if="msg.isMine" class="shrink-0 text-base leading-none">
              <Icon name="material-symbols:done-all" class="text-sky-500" />
            </span>
            <span v-html="highlight(msg.text)" />
          </div>
        </div>
      </template>
    </main>
  </aside>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const props = defineProps(['chatIdOverride', 'chatNameOverride'])
  const emit = defineEmits(['close', 'goToMessage'])

  const chatStore = useChatStore()
  const userStore = useUserStore()

  const { _id: storeChatId, users: chatUsers } = storeToRefs(chatStore)
  const { _id: userId } = storeToRefs(userStore)

  const chatFirstUser = computed(() => chatUsers.value?.find((u) => u._id !== userId.value))
  const effectiveChatId = computed(() => props.chatIdOverride || storeChatId.value)
  const effectiveChatName = computed(() => props.chatNameOverride || chatFirstUser.value?.name)

  const { decryptMessage } = useCrypto()
  const { getKey: getPrivateKey } = useIndexedDB()

  const query = ref('')
  const messages = ref([])
  const inputEl = ref(null)

  const results = computed(() => {
    if (!query.value.trim()) return []
    const q = query.value.trim().toLowerCase()
    return messages.value.filter((m) => m.text?.toLowerCase().includes(q))
  })

  function highlight(text) {
    if (!query.value.trim()) return text
    const q = query.value.trim()
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<span class="text-emerald-500 font-semibold">$1</span>',
    )
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB')
  }

  async function decryptText(msg) {
    if (!msg.iv) return msg.text ?? ''
    try {
      const privateKey = await getPrivateKey(userId.value, 'privateKey')
      const encryptedAESKey = msg.chat?.encryptedKeys?.find(
        (k) => k.userId === userId.value,
      )?.encryptedKey
      return await decryptMessage(msg.text, msg.iv, encryptedAESKey, privateKey)
    } catch {
      return '[encrypted]'
    }
  }

  async function fetchMessages() {
    if (!effectiveChatId.value || effectiveChatId.value === 'new-chat') {
      messages.value = []
      return
    }
    try {
      const response = await useMyAuthFetch(`message/${effectiveChatId.value}`, { method: 'GET' })
      messages.value = await Promise.all(
        response.map(async (msg) => ({
          ...msg,
          text: await decryptText(msg),
          isMine: msg.from._id === userId.value,
        })),
      )
    } catch {
      messages.value = []
    }
  }

  watch(effectiveChatId, fetchMessages)

  onMounted(async () => {
    await fetchMessages()
    await nextTick()
    inputEl.value?.focus()
  })
</script>
