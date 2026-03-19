<template>
    <div class="px-4 py-2.5 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm">
        <div class="flex flex-row items-center gap-3 flex-1 cursor-pointer" @click="$emit('showContactInfo')">
            <img src="~/assets/img/default_profile.png" width="40" height="40" />
            <div class="text-base font-semibold text-black dark:text-white">
                {{ chatUser.name }}
            </div>
        </div>
        <div class="flex flex-row items-center justify-center gap-2.5">
            <div>
                <button class='flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors'>
                    <Icon name="material-symbols:search" />
                </button>
            </div>
            <div class="relative inline-block">
                <div>
                    <button
                        type="button"
                        class='flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors'
                        @click="isMenuButton = !isMenuButton"
                        @blur="blurMenuButton"
                    >
                        <Icon name="carbon:overflow-menu-vertical" />
                    </button>
                </div>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <div v-show="isMenuButton" class="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10 dark:ring-white/10 dark:bg-neutral-900 ring-opacity-5 focus:outline-none z-10">
                        <div class="p-1">
                            <button @click="$emit('showContactInfo')" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50">
                                <Icon class="text-base" name="zondicons:information-outline"></Icon>
                                <span class="text-sm">Contact info</span>
                            </button>
                            <button @click="closeChat" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50">
                                <Icon class="text-base" name="zondicons:close-outline"></Icon>
                                <span class="text-sm">Close chat</span>
                            </button>
                            <div class="border-t border-neutral-950/10 dark:border-white/10 mx-2 my-1.5"></div>
                            <button class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-rose-600/10 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 flex items-center gap-3 rounded-xl hover:text-rose-700 dark:text-zinc-50">
                                <Icon class="text-base" name="zondicons:minus-outline"></Icon>
                                <span class="text-sm">Clear chat</span>
                            </button>
                            <button class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-rose-600/10 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 flex items-center gap-3 rounded-xl hover:text-rose-700 dark:text-zinc-50">
                                <Icon class="text-base" name="line-md:trash"></Icon>
                                <span class="text-sm">Delete chat</span>
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    data() {
        return {
            isMenuButton: false
        }
    },
    computed: {
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
    methods: {
        ...mapActions(useChatStore, {
            setChatAction: 'setChat'
        }),
        blurMenuButton() {
            setTimeout(() => {
                this.isMenuButton = false
            }, 100)
        },
        closeChat() {
            this.setChatAction({
                _id: '',
                user: {}
            })
        }
    }
}
</script>

<style>

</style>