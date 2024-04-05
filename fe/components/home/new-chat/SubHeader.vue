<template>
  <div class="px-3 py-1.5 flex flex-row items-center bg-white">
    <div class="flex-1 relative">
      <input
        ref="rtextinput"
        type="text"
        placeholder="Search"
        class="bg-gray-100 pl-16 pr-8 py-2 text-sm rounded-md w-full placeholder:text-gray-600 focus:outline-none"
        :value="text"
        @input="debouncedInput"
        @focus="isSearching = true"
        @blur="() => !text ? isSearching = false : null"
      >
      <div class="absolute left-3.5 top-0.5">
        <button
          v-if="!isSearching"
          @click="isSearching = !isSearching"
          class="text-xl"
        >
          <Icon name="material-symbols:search" />
        </button>
        <button v-else @click="isSearching = !isSearching" class="text-teal-600 text-xl">
          <Icon name="material-symbols:arrow-back" />
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