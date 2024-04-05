<template>
    <aside class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
        <header>
            <HomeContactInfoHeader @close="$emit('close')" />
        </header>
        <main class="flex flex-col gap-3">
            <HomeContactInfoProfile />
            <HomeContactInfoAbout />
            <HomeContactInfoActions />
        </main>
    </aside>
</template>

<script>
export default {

}
</script>

<style>

</style>