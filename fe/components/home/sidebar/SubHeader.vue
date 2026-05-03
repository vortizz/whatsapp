<template>
  <div class="px-5 py-1.5 flex flex-col dark:bg-neutral-900">
    <div
      class="flex items-center w-full h-10 rounded-full"
      :class="{
        'bg-white dark:bg-neutral-900 outline outline-2 outline-emerald-500': isSearching,
        'bg-stone-400/15 hover:outline hover:outline-black/10  dark:hover:outline-stone-400/15':
          !isSearching,
      }"
    >
      <div
        class="text-xl leading-none pl-4 pr-3 h-full flex items-center text-slate-500 dark:text-white/60"
      >
        <Icon name="material-symbols:search" />
      </div>
      <input
        ref="rtextinput"
        type="text"
        :placeholder="
          filter === 'unread'
            ? 'Search unread chats'
            : filter === 'groups'
              ? 'Search groups'
              : 'Search or start a new chat'
        "
        class="bg-transparent text-sm flex-1 text-neutral-950 placeholder:text-slate-500 dark:placeholder:text-white/60 h-full outline-none dark:text-zinc-50"
        :value="text"
        @input="debouncedInput"
        @focusin="isSearching = true"
        @focusout="isSearching = false"
      />
      <div v-if="text" class="p-1 h-full">
        <button
          class="flex items-center text-xl leading-none text-neutral-950 h-full rounded-full px-2 hover:bg-stone-100 dark:text-zinc-50 dark:hover:bg-white/10 transition-colors"
          @click="text = ''"
        >
          <Icon name="material-symbols:close" />
        </button>
      </div>
    </div>
    <div class="mt-2 flex items-center gap-2">
      <button
        class="text-sm font-semibold rounded-full px-3 py-1 border border-bg-black/20 dark:border-white/10 transition-colors"
        :class="{
          'bg-emerald-100 text-green-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-green-100':
            filter === 'all',
          'hover:bg-stone-100 dark:hover:bg-stone-400/15 dark:bg-neutral-900 dark:text-white/60':
            filter !== 'all',
        }"
        @click="setFilter('all')"
      >
        All
      </button>
      <button
        class="text-sm font-semibold rounded-full px-3 py-1 border border-bg-black/20 dark:border-white/10 transition-colors"
        :class="{
          'bg-emerald-100 text-green-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-green-100':
            filter === 'unread',
          'hover:bg-stone-100 dark:hover:bg-stone-400/15 dark:bg-neutral-900 dark:text-white/60':
            filter !== 'unread',
        }"
        @click="setFilter('unread')"
      >
        Unread {{ unreadMessagesCount }}
      </button>
      <button
        class="text-sm font-semibold rounded-full px-3 py-1 border border-bg-black/20 dark:border-white/10 transition-colors"
        :class="{
          'bg-emerald-100 text-green-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-green-100':
            filter === 'groups',
          'hover:bg-stone-100 dark:hover:bg-stone-400/15 dark:bg-neutral-900 dark:text-white/60':
            filter !== 'groups',
        }"
        @click="setFilter('groups')"
      >
        Groups
      </button>
    </div>
    <!-- <div class="w-11 flex justify-center">
      <button @click="unreadChats = !unreadChats" class="rounded-full px-1" :class="unreadChats ? 'text-white bg-teal-600' : ''">
        <Icon name="fluent-mdl2:sort-lines" />
      </button>
    </div> -->
  </div>
</template>

<script setup>
  import { useChatStore } from '../../../store/chat'
  import { storeToRefs } from 'pinia'

  const emit = defineEmits(['settext', 'setunreadChats', 'setgroupChats'])

  const { unreadMessagesCount } = storeToRefs(useChatStore())

  const isSearching = ref(false)
  const text = ref('')
  const filter = ref('all')

  const debouncedInput = debounce((e) => (text.value = e.target.value), 500)

  watch(text, (newValue) => {
    emit('settext', newValue)
  })

  function setFilter(value) {
    filter.value = value
    emit('setunreadChats', value === 'unread')
    emit('setgroupChats', value === 'groups')
  }
</script>

<style scoped></style>
