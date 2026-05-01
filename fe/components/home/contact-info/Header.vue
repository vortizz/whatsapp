<template>
  <div
    class="border-l border-gray-200 dark:border-white/10 px-4 py-2.5 flex flex-row items-center gap-2.5"
  >
    <div>
      <button
        aria-label="close-contact-info"
        class="text-2xl leading-6 p-2 rounded-full hover:bg-stone-100 text-neutral-950 dark:text-white flex items-center dark:hover:bg-white/5 transition-colors"
        @click="emit('close')"
      >
        <Icon name="material-symbols:close" />
      </button>
    </div>
    <div class="text-neutral-950 dark:text-white text-base">Contact info</div>
  </div>
</template>

<script setup>
  const emit = defineEmits(['close'])
</script>

<style></style>
