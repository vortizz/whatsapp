<template>
  <div>
    <span class="text-center text-lg mt-5 inline-block dark:text-zinc-300">
      Set your encryption passphrase.
    </span>

    <div
      class="mt-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 p-4 text-sm text-amber-800 dark:text-amber-300 leading-relaxed"
    >
      <div class="flex gap-2">
        <svg
          class="w-5 h-5 shrink-0 mt-0.5 text-amber-500"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <span>
          This passphrase <strong>cannot be recovered</strong> by anyone, not even the platform. It
          protects your private encryption key. If you forget it, you will permanently lose access
          to your encrypted messages.
        </span>
      </div>
    </div>

    <div class="flex flex-col mt-6 gap-5">
      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Set Passphrase</label>
        <div class="relative">
          <input
            v-model="passphrase"
            :type="showPassphrase ? 'text' : 'password'"
            class="w-full text-lg border rounded-2xl py-3 pl-4 pr-12 font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
            :class="
              mismatch
                ? 'border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-teal-600 dark:border-zinc-600'
            "
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-4 text-slate-400 dark:text-zinc-400"
            @click="showPassphrase = !showPassphrase"
          >
            <Icon
              :name="showPassphrase ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="text-lg"
            />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Confirm Passphrase</label>
        <div class="relative">
          <input
            v-model="confirmPassphrase"
            :type="showConfirmPassphrase ? 'text' : 'password'"
            class="w-full text-lg border rounded-2xl py-3 pl-4 pr-12 font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
            :class="
              mismatch
                ? 'border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-teal-600 dark:border-zinc-600'
            "
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-4 text-slate-400 dark:text-zinc-400"
            @click="showConfirmPassphrase = !showConfirmPassphrase"
          >
            <Icon
              :name="showConfirmPassphrase ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="text-lg"
            />
          </button>
        </div>
        <span v-if="mismatch" class="text-red-500 text-xs">Passphrases do not match</span>
      </div>
    </div>

    <button
      type="button"
      class="mt-7 text-lg rounded-md w-full py-3 text-white font-semibold duration-300"
      :class="
        ready
          ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
          : 'bg-teal-300 dark:bg-teal-900 cursor-not-allowed'
      "
      :disabled="!ready"
      @click="emit('next', { passphrase })"
    >
      Next
    </button>
  </div>
</template>

<script setup>
  const emit = defineEmits(['next'])

  const passphrase = ref('')
  const confirmPassphrase = ref('')
  const showPassphrase = ref(false)
  const showConfirmPassphrase = ref(false)

  const mismatch = computed(
    () => confirmPassphrase.value.length > 0 && passphrase.value !== confirmPassphrase.value,
  )
  const ready = computed(
    () =>
      passphrase.value.length > 0 &&
      confirmPassphrase.value.length > 0 &&
      passphrase.value === confirmPassphrase.value,
  )
</script>
