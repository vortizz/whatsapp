<template>
  <div>
    <span class="text-center text-lg mt-5 inline-block dark:text-zinc-300">
      Save your recovery codes.
    </span>

    <p class="text-justify text-sm text-zinc-500 dark:text-zinc-400 mt-1">
      Store these codes somewhere safe. They can be used to recover access to your account if you
      forget your passphrase.
    </p>

    <div class="mt-5 flex flex-wrap w-full gap-2">
      <div
        v-for="(code, i) in codes"
        :key="i"
        class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2 px-1 text-center font-mono text-sm text-zinc-700 dark:text-zinc-300 tracking-wide w-full"
      >
        {{ code }}
      </div>
    </div>

    <button
      type="button"
      class="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400 font-semibold text-sm hover:bg-teal-50 dark:hover:bg-teal-950 duration-300"
      @click="copyAll"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
      {{ copied ? 'Copied!' : 'Copy all codes' }}
    </button>

    <label
      class="mt-5 flex items-start gap-3 cursor-pointer select-none text-sm text-zinc-600 dark:text-zinc-400"
    >
      <input
        v-model="savedCodes"
        type="checkbox"
        class="mt-0.5 h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
      />
      I have saved my recovery codes in a safe place.
    </label>

    <button
      type="button"
      class="mt-7 text-lg rounded-md w-full py-3 text-white font-semibold duration-300"
      :class="
        savedCodes
          ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
          : 'bg-teal-300 dark:bg-teal-900 cursor-not-allowed'
      "
      :disabled="!(savedCodes && codes.length && !props.isLoading)"
      @click="emit('finish', { codes })"
    >
      {{ props.isLoading ? 'Creating account...' : 'Finish' }}
    </button>
  </div>
</template>

<script setup>
  const emit = defineEmits(['finish'])
  const props = defineProps({
    isLoading: Boolean,
  })
  const { generateRecoveryCodes } = useCrypto()

  const codes = ref([])
  const savedCodes = ref(false)
  const copied = ref(false)

  onMounted(() => {
    codes.value = generateRecoveryCodes()
  })

  async function copyAll() {
    await navigator.clipboard.writeText(codes.value.join('\n'))
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
</script>
