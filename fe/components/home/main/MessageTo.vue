<template>
  <div 
    class="p-2.5 bg-[#D9FDD3] dark:bg-emerald-900 w-fit relative ml-auto shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-80"
    :class="isFirst ? 'rounded-l-md rounded-br-md' : 'rounded-md'"
  >
    <span v-if="isFirst" class="block absolute right-[-8px] top-0 h-[13px] w-2 text-[#D9FDD3] dark:text-emerald-900">
      <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-out</title><path opacity="0.13" d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z"></path><path fill="currentColor" d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"></path></svg>
    </span>
    <div class="flex flex-row gap-2">
        <div class="text-sm text-neutral-950 dark:text-white">
            {{ text }}
        </div>
        <div class="invisible flex">
          <span class="text-[11px]">
            {{ formattedTime }}
          </span>
          <span class="text-base mt-[-4px] leading-none" :class="status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
            <Icon name="codicon:check" v-if="status === StatusMessage.SENT" />
            <Icon name="codicon:check-all" v-else />
          </span>
        </div>
    </div>
    <div class="absolute bottom-1 right-2 flex justify-center items-end gap-1">
      <span class="text-[11px] text-black/60 dark:text-white/60">
        {{ formattedTime }}
      </span>
      <span class="text-base mt-[-4px] leading-none" :class="status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
        <Icon name="mdi:check" v-if="status === StatusMessage.SENT" />
        <Icon name="mdi:check-all" v-else />
      </span>
    </div>
  </div>
</template>

<script setup>
import { StatusMessage } from '../../../utils/status-message'

const props = defineProps(['text', 'date', 'status', 'isFirst'])

const formattedTime = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
})
</script>

<style>

</style>
