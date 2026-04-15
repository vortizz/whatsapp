<template>
  <aside class="flex-1 min-w-80 max-w-sm bg-white dark:bg-neutral-900 flex flex-col">
    <header class="flex items-center gap-3 px-4 py-3">
      <button @click="$emit('close')" class="flex items-center p-2 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300">
        <Icon name="mdi:close" class="text-2xl" />
      </button>
      <span class="text-base font-medium text-neutral-950 dark:text-white">Message info</span>
    </header>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <Icon name="mdi:loading" class="text-3xl text-gray-400 animate-spin" />
    </div>

    <div v-else-if="info" class="flex-1 overflow-y-auto">
      <!-- Message preview -->
      <div class="px-5">
        <div class="rounded-lg bg-[#efeae2] dark:bg-[#2E2E2E] p-6">
          <div>
            <HomeMainMessageTo
              :_id="message._id"
              :text="message.text"
              :date="info.sentAt"
              :status="message.status"
              :replyTo="message.replyTo"
              :forwarded="message.forwarded"
              :isFirst="true"
              :showInfoButton="false"
              :isMenuOpen="isMenuOpen"
              @toggle-menu="isMenuOpen = !isMenuOpen"
              @reply="handleReply"
              @enter-forward="handleForward"
              @enter-select="handleDelete"
              @scroll-to="() => {}"
            />
          </div>
        </div>
      </div>

      <!-- 1:1 info -->
      <template v-if="!info.isGroup">
        <div class="py-2 px-3">
          <div class="flex items-center gap-4 px-5 py-4">
            <Icon name="mdi:check-all" class="text-xl text-sky-400 flex-none" />
            <div>
              <p class="text-base font-medium text-neutral-950 dark:text-white">Read</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ info.readAt ? formatDatetime(info.readAt) : '--' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 px-5 py-4">
            <Icon name="mdi:check-all" class="text-xl text-gray-400 flex-none" />
            <div>
              <p class="text-base font-medium text-neutral-950 dark:text-white">Delivered</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ info.receivedAt ? formatDatetime(info.receivedAt) : '--' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 px-5 py-4">
            <Icon name="mdi:check" class="text-xl text-gray-400 flex-none" />
            <div>
              <p class="text-base font-medium text-neutral-950 dark:text-white">Sent</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ info.sentAt ? formatDatetime(info.sentAt) : '--' }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Group info -->
      <template v-else>
        <!-- Read by -->
        <div v-if="info.read.length > 0">
          <div class="flex items-center gap-3 px-5 pt-5 pb-2">
            <Icon name="mdi:check-all" class="text-lg text-sky-400 flex-none" />
            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Read by</span>
          </div>
          <div>
            <div v-for="member in info.read" :key="member._id" class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3">
                <AvatarPlaceholder :size="45" :name="member.name" />
                <div class="flex flex-col gap-0.5">
                  <div class="text-sm text-neutral-950 dark:text-white">{{ member.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDatetime(member.at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivered to -->
        <div v-if="info.received.length > 0">
          <div class="flex items-center gap-3 px-5 pt-5 pb-2" :class="{ 'border-t border-gray-100 dark:border-neutral-700': info.read.length > 0 }">
            <Icon name="mdi:check-all" class="text-lg text-gray-400 flex-none" />
            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Delivered to</span>
          </div>
          <div>
            <div v-for="member in info.received" :key="member._id" class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3">
                <AvatarPlaceholder :size="45" :name="member.name" />
                <div class="flex flex-col gap-0.5">
                  <div class="text-sm text-neutral-950 dark:text-white">{{ member.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDatetime(member.at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent to (not yet delivered) -->
        <div v-if="info.sent.length > 0">
          <div class="flex items-center gap-3 px-5 pt-5 pb-2" :class="{ 'border-t border-gray-100 dark:border-neutral-700': info.read.length > 0 || info.received.length > 0 }">
            <Icon name="mdi:check" class="text-lg text-gray-400 flex-none" />
            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Sent to</span>
          </div>
          <div>
            <div v-for="member in info.sent" :key="member._id" class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3">
                <AvatarPlaceholder :size="45" :name="member.name" />
                <div class="flex flex-col gap-0.5">
                  <div class="text-sm text-neutral-950 dark:text-white">{{ member.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDatetime(info.sentAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { useMessageReplyStore } from '~/store/messageReply'
import { useMessageSelectionStore } from '~/store/messageSelection'

const props = defineProps(['message'])
const emit = defineEmits(['close'])

const info = ref(null)
const loading = ref(false)
const isMenuOpen = ref(false)

const { setReply } = useMessageReplyStore()
const { enterSelectionMode, enterForwardMode } = useMessageSelectionStore()

function handleReply() {
  setReply({ _id: props.message._id, text: props.message.text, senderName: 'You' })
  emit('close')
}

function handleForward(id) {
  enterForwardMode(id)
  emit('close')
}

function handleDelete(id) {
  enterSelectionMode(id)
  emit('close')
}

function formatDatetime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const time = date.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()

  if (date.toDateString() === today.toDateString()) return `Today at ${time}`
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year} at ${time}`
}

async function load(id) {
  if (!id) return
  loading.value = true
  info.value = null
  try {
    info.value = await useMyAuthFetch(`message/${id}/info`, { method: 'GET' })
  } finally {
    loading.value = false
  }
}

watch(() => props.message?._id, (id) => load(id), { immediate: true })
</script>
