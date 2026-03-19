<template>
    <div
        class="inline-flex items-center justify-center rounded-full bg-stone-200 text-stone-500 dark:bg-white/10 dark:text-white/60"
        :style="avatarStyle"
    >
        <Icon name="solar:user-bold" :style="iconStyle" />
    </div>
</template>

<script setup>
const props = defineProps({
    size: {
        type: [Number, String],
        default: 48
    },
    iconScale: {
        type: Number,
        default: 0.55
    }
})

const normalizedSize = computed(() => {
    if (typeof props.size === 'number') {
        return props.size
    }

    const parsedSize = Number.parseInt(props.size, 10)
    return Number.isNaN(parsedSize) ? 48 : parsedSize
})

const avatarStyle = computed(() => ({
    width: `${normalizedSize.value}px`,
    height: `${normalizedSize.value}px`
}))

const iconStyle = computed(() => ({
    fontSize: `${Math.round(normalizedSize.value * props.iconScale)}px`
}))
</script>
