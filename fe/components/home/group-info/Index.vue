<template>
    <aside class="flex-1 min-w-80 bg-white dark:bg-neutral-900 flex flex-col">
        <header>
            <HomeGroupInfoHeader @close="emit('close')" />
        </header>
        <main class="flex flex-col overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <HomeGroupInfoProfile @search="emit('search')" @openAddMember="openModal" />
            <!-- Divider -->
            <div class="border-t border-black/10 dark:border-white/10 mx-4 my-2"></div>
            <HomeGroupInfoMembers @openAddMember="openModal" @viewMember="m => emit('viewMember', m)" />
        </main>
    </aside>
</template>

<script setup>
const emit = defineEmits(['close', 'viewMember', 'search'])
const { openModal } = useAddMemberModal()
</script>
