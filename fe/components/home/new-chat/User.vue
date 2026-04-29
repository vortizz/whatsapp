<template>
  <div
    :aria-label="name"
    role="button"
    class="flex flex-row mx-2.5 px-3.5 pt-3.5 gap-3.5 hover:bg-stone-400/15 rounded-xl group cursor-pointer"
    @click="emit('select-user')"
  >
    <div>
      <AvatarPlaceholder :size="48" :name="name" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5">
      <div>
        <div
          class="text-base max-h-6 text-neutral-950 grow text-ellipsis overflow-hidden dark:text-white"
        >
          {{ name }}
        </div>
        <div
          class="text-sm text-black/60 dark:text-white/60 grow max-h-5 text-ellipsis overflow-hidden"
        >
          {{ about }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps(['name', 'about'])
  const emit = defineEmits(['select-user'])
</script>

<style></style>
