<template>
  <div class="mt-6">
    <div class="flex flex-col gap-1">
      <label for="passphrase" class="uppercase text-xs font-semibold dark:text-zinc-300"
        >Passphrase or Recovery Code</label
      >
      <div class="relative">
        <input
          id="passphrase"
          v-model="passphrase"
          :type="showPassphrase ? 'text' : 'password'"
          class="w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 font-medium bg-zinc-50 focus:bg-white focus:outline-none focus:border-teal-600 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:placeholder-zinc-500"
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

    <button
      type="button"
      class="mt-8 text-lg rounded-md w-full py-3 text-white font-semibold duration-300"
      :class="
        passphrase
          ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
          : 'bg-teal-300 dark:bg-teal-900 cursor-not-allowed'
      "
      :disabled="!passphrase"
      @click="emit('confirm', { passphrase })"
    >
      Confirm
    </button>
  </div>
</template>

<script setup>
  const emit = defineEmits(['confirm'])

  const passphrase = ref('')
  const showPassphrase = ref(false)
</script>
