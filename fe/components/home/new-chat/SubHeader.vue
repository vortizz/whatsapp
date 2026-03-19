<template>
  <div class="px-5 py-1.5 bg-white flex flex-col dark:bg-neutral-900">
    <div 
      class="flex items-center w-full h-10 rounded-full"
      :class="{
        'bg-white dark:bg-neutral-900 outline outline-2 outline-emerald-500': isSearching,
        'bg-stone-400/15 hover:outline hover:outline-black/10  dark:hover:outline-stone-400/15': !isSearching
      }"
    >
      <div class="text-xl leading-none pl-4 pr-3 h-full flex items-center text-slate-500 dark:text-white/60">
        <Icon name="material-symbols:search" />
      </div>
      <input
        ref="rtextinput"
        type="text"
        placeholder="Search name"
        class="bg-transparent text-sm flex-1 text-neutral-950 placeholder:text-slate-500 dark:placeholder:text-white/60 h-full outline-none dark:text-zinc-50 "
        :value="text"
        @input="debouncedInput"
        @focusin="isSearching = true"
        @focusout="isSearching = false"
      >
      <div v-if="text" class="p-1 h-full">
        <button @click="text = ''" class="flex items-center text-xl leading-none text-neutral-950 h-full rounded-full px-2 hover:bg-stone-100 dark:text-zinc-50 dark:hover:bg-white/10 transition-colors">
          <Icon name="material-symbols:close" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isSearching: false,
      text: '',
      debouncedInput: debounce((e) => this.text = e.target.value, 500),
    }
  },
  watch: {
    isSearching: {
      handler(newValue) {
        if (newValue) {
          return this.$refs.rtextinput.focus()
        }
        this.text = ''
        return this.$refs.rtextinput.blur()
      }
    },
    text: {
      handler(newValue) {
        this.$emit('settext', newValue)
      }
    },
  }
}

</script>

<style scoped>
</style>