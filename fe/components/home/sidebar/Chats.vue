<template>
    <div>
        <HomeSidebarChat v-for="i in 15" :key="i" :name="i" />
        <div class="text-center text-xs p-3">
            <Icon name="oi:lock-locked" />
            Your personal messages are end-to-end encrypted
        </div>
    </div>
</template>

<script>


</script>

<style>

</style>