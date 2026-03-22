<template>
    <div
        ref="dateEl"
        class="sticky top-3 text-xs px-3 py-1 font-semibold bg-white/90 dark:bg-neutral-800 dark:text-white/60 text-gray-600 z-10 rounded-md w-fit ml-auto mr-auto shadow-[0_0_1px_1px_rgba(0,0,0,0.06),_0_1px_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-out will-change-transform"
        :class="isHidden ? '-translate-y-12 opacity-0' : 'translate-y-0 opacity-100'"
    >
        {{ formattedDate }}
    </div>
</template>
  
<script setup>
const props = defineProps(['date'])

const dateEl = ref(null)
const isStuck = ref(false)
const isHidden = ref(false)

let scrollParent = null
let hideTimer = null

function getScrollParent(element) {
    let parent = element?.parentElement

    while (parent) {
        const { overflowY } = window.getComputedStyle(parent)
        if (overflowY === 'auto' || overflowY === 'scroll') {
            return parent
        }
        parent = parent.parentElement
    }

    return window
}

function updateStickyState() {
    if (!dateEl.value) {
        return
    }

    const elementTop = dateEl.value.getBoundingClientRect().top
    const parentTop = scrollParent === window
        ? 0
        : scrollParent.getBoundingClientRect().top
    const stickyTop = parentTop + 12

    isStuck.value = Math.abs(elementTop - stickyTop) < 1

    if (!isStuck.value) {
        isHidden.value = false
    }
}

function handleScroll() {
    updateStickyState()
    isHidden.value = false

    if (hideTimer) {
        clearTimeout(hideTimer)
    }

    hideTimer = window.setTimeout(() => {
        updateStickyState()
        isHidden.value = isStuck.value
    }, 3000)
}

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

onMounted(() => {
    scrollParent = getScrollParent(dateEl.value)
    scrollParent.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    updateStickyState()
})

onBeforeUnmount(() => {
    if (hideTimer) {
        clearTimeout(hideTimer)
    }

    scrollParent?.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleScroll)
})
</script>

<style>

</style>
