<template>
    <aside class="flex-1 min-w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-white/10 flex flex-col">
        <header class="sticky top-0">
            <HomeProfileHeader @close="emit('close')" />
        </header>
        <main class="flex flex-col gap-7 pt-7">
            <HomeProfileAvatar />
            <HomeProfileName />
            <HomeProfileAbout />
        </main>
    </aside>
</template>

<script setup>
const emit = defineEmits(['close'])
</script>

<style>

</style>