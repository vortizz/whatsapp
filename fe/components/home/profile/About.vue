<template>
    <div class="bg-white px-7 pt-3.5 pb-2.5 shadow-sm flex flex-col gap-5">
        <label class="text-sm text-teal-700">
            About
        </label>
        <div
            v-if="!isEditing"
            class="flex flex-row justify-between items-center"
        >
            <span>
                {{ name }}
            </span>
            <button class="text-2xl text-gray-400" @click="isEditing = true">
                <Icon name="ic:round-edit" />
            </button>
        </div>
        <div v-else class="relative">
            <input
                ref="rname"
                type="text"
                v-model="name"
                class="w-full py-1.5 pr-14 border-b-2 border-gray-700 focus:outline-none focus:border-teal-700"
            >
            <div class="text-2xl text-gray-400 absolute right-0 inset-y-0 flex flex-row gap-0.5">
                <button class="text-2xl text-gray-400" @click="isEditing = false">
                    <Icon name="material-symbols:close" />
                </button>
                <button class="text-2xl text-gray-400">
                    <Icon name="material-symbols:check" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isEditing: false,
            name: 'Welcome to WhatsApp!'
        }
    }
}
</script>

<style>

</style>