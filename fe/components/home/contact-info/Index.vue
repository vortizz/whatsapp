<template>
    <aside class="flex-1 min-w-80 bg-white dark:bg-neutral-900 flex flex-col">
        <header>
            <HomeContactInfoHeader @close="emit('close')" />
        </header>
        <main class="flex flex-col gap-3 overflow-y-auto">
            <HomeContactInfoProfile />
            <HomeContactInfoAbout />
            <HomeContactInfoActions />
        </main>
    </aside>
</template>

<script setup>
const emit = defineEmits(['close'])

</script>

<style>

</style>