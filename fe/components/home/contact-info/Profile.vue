<template>
    <div class="flex flex-col justify-center items-center p-8 bg-white shadow-sm">
        <div class="mb-4">
            <img src="~/assets/img/default_profile.png" width="208" height="208" />
        </div>
        <div class="text-2xl">
            {{ chatUser.name }}
        </div>
        <div class="text-base mt-1 text-gray-500">
            {{ chatUser.email }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    computed: {
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
}
</script>

<style>

</style>