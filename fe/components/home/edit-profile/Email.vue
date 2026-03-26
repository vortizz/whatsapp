<template>
    <div class="px-7 pt-3.5 pb-2.5 flex flex-col gap-5">
        <div class="text-sm font-semibold dark:text-white/60 text-black/60">Email</div>
        <div class="flex items-center justify-between dark:text-white text-black/60">
            <div class="flex items-center gap-6">
                <Icon name="ic:outline-email" class="text-2xl" />
                <div class="text-base">{{ email }}</div>
            </div>
            <button
                class="flex items-center rounded-full p-2  hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                type="button"
                @click="copyEmail"
            >
                <Icon name="tabler:copy" class="text-2xl" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '../../../store/user'

const userStore = useUserStore()
const { $toast } = useNuxtApp()

const email = computed(() => userStore?.email)

const copyEmail = async () => {
    if (!email.value || !navigator?.clipboard) {
        return
    }

    await navigator.clipboard.writeText(email.value)
    $toast.success('Email copied')
}

</script>
