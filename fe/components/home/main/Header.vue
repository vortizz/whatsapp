<template>
    <div class="px-4 py-2.5 bg-gray-100 flex items-center justify-between">
        <div class="flex flex-row items-center gap-3 flex-1 cursor-pointer" @click="$emit('showContactInfo')">
            <div class="size-10 border border-black rounded-full">
                <!-- AVATAR -->
            </div>
            <div class="text-base text-black">
                Aide
            </div>
        </div>
        <div class="flex flex-row items-center justify-center gap-2.5">
            <div>
                <button class='text-2xl px-2 py-1 rounded-full active:bg-gray-300 duration-100'>
                    <Icon name="material-symbols:search" />
                </button>
            </div>
            <div class="relative inline-block">
                <div>
                    <button
                        type="button"
                        class='text-2xl px-2 py-1 rounded-full active:bg-gray-300 duration-100'
                        @click="isMenuButton = !isMenuButton"
                        @blur="blurMenuButton"
                    >
                        <Icon name="carbon:overflow-menu-vertical" />
                    </button>
                </div>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <div v-show="isMenuButton" class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div class="py-1">
                            <button @click="$emit('showContactInfo')" class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Contact info
                            </button>
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Close chat
                            </button>
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Clear chat
                            </button>
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Delete chat
                            </button>
                            <button class="text-gray-700 w-full text-left px-6 py-3 text-sm hover:bg-slate-100">
                                Block
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isMenuButton: false
        }
    },
    methods: {
        blurMenuButton() {
            setTimeout(() => {
                this.isMenuButton = false
            }, 100)
        }
    }
}
</script>

<style>

</style>