<template>
    <aside class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
        <header class="sticky top-0">
            <HomeProfileHeader @close="$emit('close')" />
        </header>
        <main class="flex flex-col gap-7 pt-7">
            <HomeProfileAvatar />
            <HomeProfileName />
            <HomeProfileAbout />
        </main>
    </aside>
</template>

<script>
export default {
    
}
</script>

<style>

</style>