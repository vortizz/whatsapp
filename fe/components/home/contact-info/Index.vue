<template>
  <aside class="flex-1 min-w-80 bg-white dark:bg-neutral-900 flex flex-col">
    <header v-if="!showSearch">
      <HomeContactInfoHeader @close="emit('close')" />
    </header>
    <HomeSearchMessages
      v-if="showSearch"
      :chat-id-override="directChatId"
      :chat-name-override="member?.name"
      @close="showSearch = false"
      @go-to-message="onGoToMessage"
    />
    <main v-else class="flex flex-col gap-3 overflow-y-auto">
      <HomeContactInfoProfile :member="member" @search="openSearch" @go-to-chat="goToChat" />
      <HomeContactInfoAbout :member="member" />
      <HomeContactInfoActions :member="member" />
    </main>
  </aside>
</template>

<script setup>
  const props = defineProps(['member'])
  const emit = defineEmits(['close', 'goToMessage', 'goToChat'])

  const showSearch = ref(false)
  const directChatId = ref('')

  watchEffect(async () => {
    if (!props.member) {
      directChatId.value = ''
      return
    }
    const chats = await useMyAuthFetch('chat')
    const direct = chats.find(
      (c) => !c.isGroup && c.users.some((u) => (u._id ?? u) === props.member._id),
    )
    directChatId.value = direct?._id ?? ''
  })

  watch(
    () => props.member,
    () => {
      showSearch.value = false
    },
  )

  function openSearch() {
    showSearch.value = true
  }

  function onGoToMessage(id) {
    showSearch.value = false
    emit('goToMessage', id, props.member ? directChatId.value : null)
  }

  function goToChat() {
    emit('goToChat', props.member ? directChatId.value : null)
  }
</script>

<style></style>
