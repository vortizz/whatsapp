<template>
  <div class="flex flex-col items-center gap-8 px-6 pt-10">
    <!-- Group icon placeholder -->
    <div
      class="w-24 h-24 rounded-full bg-stone-300 dark:bg-neutral-600 flex flex-col items-center justify-center gap-1 text-white cursor-default select-none"
    >
      <Icon name="material-symbols:group" class="text-4xl" />
    </div>

    <!-- Group name input -->
    <div class="w-full border-b-2 border-emerald-500 flex items-center gap-2 pb-1">
      <input
        ref="nameInput"
        v-model="groupName"
        type="text"
        placeholder="Group subject (optional)"
        maxlength="100"
        class="flex-1 bg-transparent text-base text-neutral-950 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none"
        @keydown.enter="create"
      />
      <span class="text-xs text-black/40 dark:text-white/40">{{ groupName.length }}/100</span>
    </div>

    <!-- Create button -->
    <button
      class="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="loading"
      @click="create"
    >
      <svg
        v-if="loading"
        aria-hidden="true"
        role="status"
        class="w-5 h-5 animate-spin"
        viewBox="0 0 100 101"
        fill="none"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
          fill-opacity="0.2"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
      <Icon v-else name="material-symbols:check-rounded" />
    </button>
  </div>
</template>

<script setup>
  import { useUserStore } from '../../../store/user'
  import { storeToRefs } from 'pinia'

  const props = defineProps(['selectedUsers'])
  const emit = defineEmits(['created'])

  const groupName = ref('')
  const loading = ref(false)
  const nameInput = ref(null)

  const userStore = useUserStore()
  const { _id: myUserId } = storeToRefs(userStore)
  const { generateGroupKey, wrapGroupKeyForMember, getPeerPublicKey } = useCrypto()

  onMounted(() => nextTick(() => nameInput.value?.focus()))

  async function create() {
    if (loading.value) return
    try {
      loading.value = true
      const chat = await useMyAuthFetch('chat/group', {
        method: 'POST',
        body: {
          user_ids: props.selectedUsers.map((u) => u._id),
          name: groupName.value || 'Group',
        },
      })

      // Generate a shared group key and wrap it for every member (including self)
      const groupKey = await generateGroupKey()
      const allMemberIds = [...props.selectedUsers.map((u) => u._id), myUserId.value]
      const keys = await Promise.all(
        allMemberIds.map(async (memberId) => {
          const memberPubKey = await getPeerPublicKey(memberId)
          const wrapped = await wrapGroupKeyForMember(groupKey, memberPubKey)
          return { userId: memberId, ...wrapped }
        }),
      )
      await useMyAuthFetch(`chat/${chat._id}/group-key`, { method: 'POST', body: { keys } })

      emit('created', chat)
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      loading.value = false
    }
  }
</script>
