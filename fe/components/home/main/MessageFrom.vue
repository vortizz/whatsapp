<template>
  <div
    data-message-bubble
    class="w-fit max-w-80 relative group bg-white pt-1.5 pb-2 pl-2.5 pr-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] dark:bg-neutral-800"
    :class="isFirst ? 'rounded-r-md rounded-bl-md' : 'rounded-md'"
    @contextmenu.prevent.stop="menuRef.open()"
  >
    <span v-if="isFirst" class="block absolute left-[-8px] top-0 h-[13px] w-2 text-white dark:text-neutral-800">
      <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
    </span>
    <div class="flex flex-row gap-2">
      <div class="text-sm text-neutral-950 dark:text-white">{{ text }}</div>
      <div class="text-[11px] invisible">{{ formattedTime }}</div>
    </div>
    <div class="text-[11px] absolute bottom-1 right-2 text-black/60 dark:text-white/60">
      {{ formattedTime }}
    </div>
    <HomeMainMessageMenu
      v-if="!isSelecting"
      ref="menuRef"
      :_id="_id"
      :text="text"
      :isMenuOpen="isMenuOpen"
      buttonClass="bg-white/95 text-gray-500 dark:bg-neutral-800/95 dark:text-white/60"
      @toggle-menu="$emit('toggle-menu')"
      @enter-select="$emit('enter-select', $event)"
    />
  </div>
</template>

<script setup>
const props = defineProps(['_id', 'text', 'date', 'isFirst', 'isMenuOpen', 'isSelecting'])
defineEmits(['toggle-menu', 'delete', 'enter-select'])

const menuRef = ref(null)

const formattedTime = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
})
</script>

<style>

</style>
