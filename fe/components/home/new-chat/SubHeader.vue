<template>
  <div class="px-5 py-1.5 bg-white flex flex-col dark:bg-neutral-900">
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
        aria-label="search-name"
        type="text"
        placeholder="Search name"
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
  </div>
</template>

<script setup>
  const emit = defineEmits(['settext'])

  const isSearching = ref(false)
  const text = ref('')
  const rtextinput = useTemplateRef('rtextinput')

  const debouncedInput = debounce((e) => (text.value = e.target.value), 500)

  watch(isSearching, (newValue) => {
    if (newValue) {
      return rtextinput.value.focus()
    }
    return rtextinput.value.blur()
  })

  watch(text, (newValue) => {
    emit('settext', newValue)
  })
</script>

<style scoped></style>
