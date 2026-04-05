<template>
  <div
    data-message-bubble
    class="relative ml-auto w-fit max-w-80 bg-[#D9FDD3] pt-1.5 pb-2 pl-2.5 pr-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] group dark:bg-emerald-900"
    :class="isFirst ? 'rounded-l-md rounded-br-md' : 'rounded-md'"
    @contextmenu.prevent.stop="menuRef.open()"
  >
    <span v-if="isFirst" class="block absolute right-[-8px] top-0 h-[13px] w-2 text-[#D9FDD3] dark:text-emerald-900">
      <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-out</title><path opacity="0.13" d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z"></path><path fill="currentColor" d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"></path></svg>
    </span>
    <div
      v-if="replyTo"
      class="mb-1.5 rounded-md overflow-hidden border-l-4 bg-black/5 dark:bg-white/5 px-2 py-2 cursor-pointer"
      :class="replyTo.isMine ? 'border-emerald-600' : 'border-amber-500'"
      @click.stop="$emit('scroll-to', replyTo._id)"
    >
      <div class="text-sm font-semibold truncate mb-0.5" :class="replyTo.isMine ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
        {{ replyTo.senderName }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ replyTo.text }}</div>
    </div>
    <div class="flex flex-row gap-2">
      <div class="text-sm text-neutral-950 dark:text-white">{{ text }}</div>
      <div class="invisible flex">
        <span class="text-[11px]">{{ formattedTime }}</span>
        <span class="text-base mt-[-4px] leading-none" :class="status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
          <Icon name="codicon:check" v-if="status === StatusMessage.SENT" />
          <Icon name="codicon:check-all" v-else />
        </span>
      </div>
    </div>
    <div class="absolute bottom-1 right-2 flex justify-center items-end gap-1">
      <span class="text-[11px] text-black/60 dark:text-white/60">{{ formattedTime }}</span>
      <span class="text-base mt-[-4px] leading-none" :class="status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
        <Icon name="mdi:check" v-if="status === StatusMessage.SENT" />
        <Icon name="mdi:check-all" v-else />
      </span>
    </div>
    <HomeMainMessageMenu
      v-if="!isSelecting"
      ref="menuRef"
      :_id="_id"
      :text="text"
      :isMenuOpen="isMenuOpen"
      buttonClass="bg-[#D9FDD3]/95 text-black/45 dark:bg-emerald-900/95 dark:text-white/60"
      @toggle-menu="$emit('toggle-menu')"
      @enter-select="$emit('enter-select', $event)"
      @reply="$emit('reply')"
    />
  </div>
</template>

<script setup>
import { StatusMessage } from '../../../utils/status-message'

const props = defineProps(['_id', 'text', 'date', 'status', 'isFirst', 'isMenuOpen', 'isSelecting', 'replyTo'])
defineEmits(['toggle-menu', 'delete', 'enter-select', 'reply', 'scroll-to'])

const menuRef = ref(null)

const formattedTime = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
})
</script>

<style>

</style>
