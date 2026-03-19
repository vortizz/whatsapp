<template>
  <div class="p-2.5 bg-green-100 dark:bg-emerald-900 rounded-md w-fit relative ml-auto shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-80">
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

<script>
export default {
  props: ['text', 'date', 'status'],
  computed: {
    formattedTime() {
      const date = new Date(this.date)
      return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style>

</style>