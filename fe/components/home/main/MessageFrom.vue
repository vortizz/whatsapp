<template>
  <div
    data-message-bubble
    class="w-fit max-w-[70%] relative group bg-white pt-1.5 pb-2 pl-2.5 pr-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] dark:bg-neutral-800"
    :class="isFirst ? 'rounded-r-md rounded-bl-md' : 'rounded-md'"
    @contextmenu.prevent.stop="menuRef.open()"
  >
    <span v-if="isFirst" class="block absolute left-[-8px] top-0 h-[13px] w-2 text-white dark:text-neutral-800">
      <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
    </span>
    <div
      v-if="replyTo"
      class="mb-1.5 rounded-md overflow-hidden border-l-4 bg-black/5 dark:bg-white/5 px-2 py-1 cursor-pointer"
      :class="replyTo.isMine ? 'border-emerald-500' : 'border-amber-500'"
      @click.stop="$emit('scroll-to', replyTo._id)"
    >
      <div class="text-sm font-semibold truncate mb-0.5" :class="replyTo.isMine ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
        {{ replyTo.senderName }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ replyTo.text }}</div>
    </div>
    <div class="text-sm text-neutral-950 dark:text-white whitespace-pre-wrap">
      {{ text }}<span class="inline-block ml-1.5 float-right translate-y-[3px]">
        <span class="text-[11px] text-black/60 dark:text-white/60 whitespace-nowrap">{{ formattedTime }}</span>
      </span>
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
      @reply="$emit('reply')"
    />
  </div>
</template>

<script setup>
const props = defineProps(['_id', 'text', 'date', 'isFirst', 'isMenuOpen', 'isSelecting', 'replyTo'])
defineEmits(['toggle-menu', 'delete', 'enter-select', 'reply', 'scroll-to'])

const menuRef = ref(null)

const formattedTime = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
})
</script>

<style>

</style>
