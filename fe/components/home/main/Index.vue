<template>
    <main class="flex-2 bg-orange-50 flex flex-col">
        <header>
            <HomeMainHeader
                @showContactInfo="$emit('showContactInfo')"
            />
        </header>
        <main class="border-r-2 border-transparent flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <HomeMainMessages />
        </main>
        <footer class="sticky bottom-0">
            <HomeMainTyping />
        </footer>
    </main>
</template>

<script>
export default {

}
</script>

<style>

</style>