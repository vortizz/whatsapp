<template>
    <div class="bg-teal-700 px-7 pt-[60px] pb-4">
        <div class="flex flex-row items-center gap-7">
            <div>
                <button class="text-white text-2xl" @click="$emit('close')">
                    <Icon name="material-symbols:arrow-back" />
                </button>
            </div>
            <div class="text-white text-xl font-medium">
                Profile
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style>

</style>