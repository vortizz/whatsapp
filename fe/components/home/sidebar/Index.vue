<template>
    <aside class="flex-1 min-w-80 bg-white border-r border-gray-200 flex flex-col">
        <header class="sticky top-0">
            <HomeSidebarHeader
                @openprofile="$emit('openprofile')"
                @opennewchat="$emit('opennewchat')"
            />
            <HomeSidebarSubHeader
                @settext="e => text = e"
                @setunreadChats="e => unreadChats = e"
            />
        </header>
        <main class="border-r-2 border-transparent overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <HomeSidebarChats
                v-if="!text && !unreadChats"
            />
            <HomeSidebarFilteredChats
                v-else
                :text="text" 
                :unreadChats="unreadChats"
            />
        </main>
    </aside>
</template>

<script>
export default {
    data() {
        return {
            text: '',
            unreadChats: false
        }
    }
}
</script>

<style>

</style>