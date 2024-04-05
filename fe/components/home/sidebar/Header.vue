<template>
    <div class="px-4 py-2.5 bg-gray-100 flex items-center justify-between">
        <button class="size-10 border border-black rounded-full" @click="$emit('openprofile')">
            <!-- AVATAR -->
        </button>
        <div class="flex flex-row gap-2.5 items-center justify-center">
            <div>
                <button class='text-2xl px-2 py-1 rounded-full active:bg-gray-300 duration-100' @click="$emit('opennewchat')">
                    <Icon name="ci:chat-add" />
                </button>
            </div>
            <div class="relative inline-block">
                <div>
                    <button
                        type="button"
                        class='text-2xl px-1.5 py-0.5 rounded-full active:bg-gray-300 focus:bg-gray-300 duration-100'
                        @click="isMenuButton = !isMenuButton"
                        @blur="isMenuButton = false"
                    >
                        <Icon name="carbon:overflow-menu-vertical" />
                    </button>
                </div>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <div v-show="isMenuButton" class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div class="py-1">
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                New group
                            </button>
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Settings
                            </button>
                            <button
                                type="button"
                                @click="signout"
                                class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useWsStore } from '../../../store/websocket'

export default {
    data() {
        return {
            isMenuButton: false
        }
    },
    methods: {
        ...mapActions(useUserStore, ['logout']),
        ...mapActions(useWsStore, ['disconnectWs']),
        signout() {
            this.logout()
            this.disconnectWs()
            this.$router.push('/auth/login')
        }
    }
}
</script>

<style>

</style>