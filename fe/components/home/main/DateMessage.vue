<template>
    <div class="sticky top-3 text-xs px-3 py-1 font-semibold bg-white/90 dark:bg-neutral-800 dark:text-white/60 text-gray-600 z-10 rounded-md w-fit ml-auto mr-auto shadow-[0_0_1px_1px_rgba(0,0,0,0.06),_0_1px_0_rgba(0,0,0,0.05)]">
        {{ formattedDate }}
    </div>
</template>
  
<script setup>
const props = defineProps(['date'])

const isToday = computed(() => {
    const today = new Date()
    const date = new Date(props.date)
    return today.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
})

const isYesterday = computed(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const date = new Date(props.date)
    return yesterday.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
})

const withinAWeek = computed(() => {
    const aweekago = new Date()
    aweekago.setDate(aweekago.getDate() - 7)
    const date = new Date(props.date)
    return date >= aweekago
})

const formattedDate = computed(() => {
    if (isToday.value) {
        return 'Today'
    }
    if (isYesterday.value) {
        return 'Yesterday'
    }
    if (withinAWeek.value) {
        const date = new Date(props.date)
        return date.toLocaleString(window.navigator.language, { weekday: 'long' })
    }
    const date = new Date(props.date)
    return date.toLocaleDateString(navigator.language)
})
</script>

<style>

</style>
