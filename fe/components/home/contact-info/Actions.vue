<template>
  <div class="flex flex-col px-2.5">
    <button class="text-rose-700 dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 hover:bg-stone-100 transition-colors rounded-xl dark:hover:bg-neutral-800">
        <Icon name="ic:baseline-block" class="text-xl" />
        <span class="text-base">Block {{ chatUser.name }}</span>
    </button>
    <button class="text-rose-700 dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 hover:bg-stone-100 transition-colors rounded-xl dark:hover:bg-neutral-800">
        <Icon name="ic:baseline-delete" class="text-xl" />
        <span class="text-base">Delete chat</span>
    </button>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
  computed: {
    ...mapState(useChatStore, {
      chatId: '_id',
      chatUser: 'user'
    }),
  },
}
</script>

<style>

</style>