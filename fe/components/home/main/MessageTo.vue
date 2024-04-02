<template>
  <div class="p-2.5 bg-green-100 rounded-md w-fit relative ml-auto shadow-[0_1px_0.5px_rgba(11,20,26,.13)] max-w-80">
    <div class="flex flex-row gap-2">
        <div class="text-sm text-gray-600">
            {{ text }}
        </div>
        <div class="invisible flex">
          <span class="text-[11px]">
            {{ formattedTime }}
          </span>
          <span class="text-sm mt-[-4px]" :class="status === StatusMessage.READ ? 'text-cyan-500' : 'text-gray-500'">
            <Icon name="codicon:check" v-if="status === StatusMessage.SENT" />
            <Icon name="codicon:check-all" v-else />
          </span>
        </div>
    </div>
    <div class="absolute bottom-1 right-2 flex justify-center items-center gap-1">
      <span class="text-[11px]">
        {{ formattedTime }}
      </span>
      <span class="text-sm mt-[-4px]" :class="status === StatusMessage.READ ? 'text-cyan-500' : 'text-gray-500'">
        <Icon name="codicon:check" v-if="status === StatusMessage.SENT" />
        <Icon name="codicon:check-all" v-else />
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