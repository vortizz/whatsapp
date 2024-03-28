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
            const date = new Date(this.date)
            return date.toLocaleDateString(navigator.language)
        }
    }
}
</script>

<style>

</style>