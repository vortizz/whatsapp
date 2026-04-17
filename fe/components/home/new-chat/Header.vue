<template>
  <div class="bg-white p-2.5 dark:bg-neutral-900">
    <div class="flex flex-row items-center gap-4">
      <div>
        <button
          class="text-neutral-950 dark:text-white text-2xl flex items-center p-2 hover:bg-stone-100 dark:hover:bg-white/5 rounded-full transition-colors"
          @click="emit('close')"
        >
          <Icon name="material-symbols:arrow-back" />
        </button>
      </div>
      <div class="text-neutral-950 dark:text-white text-base">New chat</div>
    </div>
  </div>
</template>

<script setup>
  const emit = defineEmits(['close'])
</script>

<style></style>
