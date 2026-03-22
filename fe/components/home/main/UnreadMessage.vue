<template>
    <div class="flex justify-center items-center bg-[#ffffff40] py-1">
        <div class="rounded-full px-4 py-2 bg-white text-gray-600 text-xs font-semibold border border-neutral-950/10 dark:border-white/10">
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