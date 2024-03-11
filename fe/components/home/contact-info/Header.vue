<template>
    <div class="border-l border-gray-200 px-4 py-2.5 bg-gray-100 flex flex-row items-center gap-2.5">
        <div>
            <button 
                class='text-2xl leading-6 p-2 rounded-full active:bg-gray-300 duration-100'
                @click="$emit('close')"
            >
                <Icon name="material-symbols:close" />
            </button>
        </div>
        <div class="text-black text-base">
            Contact info
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style>

</style>