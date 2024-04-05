<template>
    <aside class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
        <header class="sticky top-0">
            <HomeNewChatHeader @close="$emit('close')" />
            <HomeNewChatSubHeader @settext="e => text = e" />
        </header>
        <main class="flex flex-col gap-7 overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <HomeNewChatUsers @close="$emit('close')" :text="text" />
        </main>
    </aside>
</template>

<script>
export default {
    data() {
        return {
            text: ''
        }
    }
}
</script>

<style>

</style>