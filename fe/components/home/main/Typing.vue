<template>
    <div class="py-3 pl-10 pr-4 w-full bg-gray-100 flex flex-row gap-4 items-center">
        <div class="flex-1">
            <input
                type="text"
                v-model="message"
                placeholder="Type a message"
                class="w-full text-sm rounded-lg py-3 px-5 focus:outline-none placeholder:text-gray-600"
            >
        </div>
        <div>
            <button class='text-2xl p-2 leading-6 rounded-full active:bg-gray-300 duration-100'>
                <Icon name="material-symbols:send" />
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            message: ''
        }
    }
}
</script>

<style>

</style>