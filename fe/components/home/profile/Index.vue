<template>
    <HomeEditProfile 
        v-if="isDisplayingEditProfile"
        @close="isDisplayingEditProfile = false"
    />
    <aside v-else class="flex-1 min-w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-white/10 flex flex-col">
        <header class="sticky top-0">
            <HomeProfileHeader />
        </header>
        <main class="flex flex-col gap-14 pt-7">
            <HomeProfileAvatar />
            <HomeProfileActions 
                @openProfile="isDisplayingEditProfile = true"
            />
        </main>
    </aside>
</template>

<script setup>

const isDisplayingEditProfile = ref(false)
</script>