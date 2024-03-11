<template>
    <div class="h-full flex flex-row text-gray-600">
        <aside class="flex-1 min-w-80 bg-white border-r border-gray-200 flex flex-col">
            <header class="sticky top-0">
                <HomeSidebarHeader />
                <HomeSidebarSubHeader />
            </header>
            <main class="border-r-2 border-transparent overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <HomeSidebarChats />
            </main>
        </aside>
        <main class="flex-2 bg-orange-50 flex flex-col">
            <header>
                <HomeMainHeader @showContactInfo="isDisplayingContactInfo = true" />
            </header>
            <main class="border-r-2 border-transparent flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <HomeMainMessages />
            </main>
            <footer class="sticky bottom-0">
                <HomeMainTyping />
            </footer>
        </main>
        <aside v-show="isDisplayingContactInfo" class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
            <header>
                <HomeContactInfoHeader @close="isDisplayingContactInfo = false" />
            </header>
            <main class="flex flex-col gap-3">
                <HomeContactInfoProfile />
                <HomeContactInfoAbout />
                <HomeContactInfoActions />
            </main>
        </aside>
    </div>
</template>

<script>
definePageMeta({
    layout: 'home'
})
export default {
    data() {
        return {
            isDisplayingContactInfo: true
        }
    }
}
</script>

<style>

</style>