<template>
    <div class="flex justify-center items-center dark:bg-neutral-900 bg-white/30 py-1">
        <div class="rounded-full px-4 py-2 bg-white dark:bg-neutral-800 text-gray-600 dark:text-white text-xs font-semibold">
            {{ count }} unread messages
        </div>
    </div>
</template>
  
<script setup>
defineProps({
    count: {
        type: Number,
        required: true
    }
})
</script>

<style>

</style>