<template>
  <div class="p-2.5 bg-green-100 rounded-md w-fit relative ml-auto shadow-[0_1px_0.5px_rgba(11,20,26,.13)] max-w-80">
    <div class="flex flex-row gap-2">
        <div class="text-sm text-gray-600">
            {{ text }}
        </div>
        <div class="text-[11px] invisible">
            {{ formattedTime }}
        </div>
    </div>
    <div class="text-[11px] absolute bottom-1 right-2">
      {{ formattedTime }}
    </div>
  </div>
</template>

<script>
export default {
  props: ['text', 'date'],
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