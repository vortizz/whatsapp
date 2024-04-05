<template>
    <div class="sticky top-3 text-xs p-2.5 bg-gray-50 rounded-md w-fit ml-auto mr-auto shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
        {{ formattedDate }}
    </div>
</template>
  
<script>
export default {
    props: ['date'],
    computed: {
        formattedDate() {
            if (this.isToday) {
                return 'Today'
            }
            if (this.isYesterday) {
                return 'Yesterday'
            }
            if (this.withinAWeek) {
                const date = new Date(this.date)
                return date.toLocaleString(window.navigator.language, {weekday: 'long'})
            }
            const date = new Date(this.date)
            return date.toLocaleDateString(navigator.language)
        },
        isToday() {
            const today = new Date()
            const date = new Date(this.date)
            return today.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
        },
        isYesterday() {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const date = new Date(this.date)
            return yesterday.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
        },
        withinAWeek() {
            const aweekago = new Date()
            aweekago.setDate(aweekago.getDate() - 7)
            const date = new Date(this.date)
            return date >= aweekago
        }
    }
}
</script>

<style>

</style>