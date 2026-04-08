<template>
    <aside class="flex-1 min-w-80 bg-white border-r border-gray-200 dark:border-black/80 flex flex-col">
        <header class="sticky top-0 z-10">
            <HomeSidebarHeader
                @opennewchat="emit('opennewchat')"
                @opennewgroup="emit('opennewgroup')"
            />
            <HomeSidebarSubHeader
                @settext="e => text = e"
                @setunreadChats="e => unreadChats = e"
            />
        </header>
        <main class="border-r-2 border-transparent overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent px-2.5 dark:bg-neutral-900">
            <HomeSidebarChats
                v-if="!text && !unreadChats"
                @showContactInfo="emit('showContactInfo')"
            />
            <HomeSidebarFilteredChats
                v-else
                :text="text" 
                :unreadChats="unreadChats"
            />
        </main>
    </aside>
</template>

<script setup>
const emit = defineEmits(['opennewchat', 'opennewgroup', 'showContactInfo'])

const text = ref('')
const unreadChats = ref(false)

</script>

<style>

</style>