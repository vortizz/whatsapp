<template>
  <div class="flex flex-col mx-8 py-5 gap-1.5 border-b border-black/10 dark:border-white/10">
    <div class="text-sm text-black/60 dark:text-white/60 font-semibold">About</div>
    <div class="text-base text-neutral-950 dark:text-white">
      {{ displayUser.about }}
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const props = defineProps(['member'])

  const { users: chatUsers } = storeToRefs(useChatStore())
  const { _id: userId } = storeToRefs(useUserStore())

  const chatFirstUser = computed(() => chatUsers.value?.find((u) => u._id !== userId.value))
  const displayUser = computed(() => props.member ?? chatFirstUser.value)
</script>

<style></style>
