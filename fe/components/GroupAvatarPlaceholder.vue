<template>
    <div class="relative flex-none" :style="containerStyle">
        <div
            v-for="(slot, i) in slots"
            :key="i"
            class="absolute rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 font-semibold text-white select-none leading-none"
            :style="getSlotStyle(i, slot)"
        >
            {{ slot.label }}
        </div>
    </div>
</template>

<script setup>
import { getAvatarColor } from '~/utils/avatar-color'

const props = defineProps({
    size: {
        type: [Number, String],
        default: 48
    },
    users: {
        type: Array,
        default: () => []
    }
})

const normalizedSize = computed(() => {
    if (typeof props.size === 'number') return props.size
    const parsed = Number.parseInt(props.size, 10)
    return Number.isNaN(parsed) ? 48 : parsed
})

const totalCount = computed(() => props.users.length)

// When there are more than 4 users, the 4th slot becomes the overflow counter.
// Slots is always max 4 items.
const slots = computed(() => {
    const users = props.users
    const total = users.length

    if (total <= 4) {
        return users.slice(0, 4).map(u => ({ label: initial(u), color: getAvatarColor(u.name) }))
    }

    const overflow = total - 3
    return [
        ...users.slice(0, 3).map(u => ({ label: initial(u), color: getAvatarColor(u.name) })),
        { label: `+${overflow}`, color: null },
    ]
})

const slotCount = computed(() => slots.value.length)

const containerStyle = computed(() => ({
    width: `${normalizedSize.value}px`,
    height: `${normalizedSize.value}px`
}))

const LAYOUTS = {
    2: {
        ratio: 0.68,
        positions: (s, m) => [
            { top: 0, left: 0 },
            { top: s - m, left: s - m },
        ],
    },
    3: {
        ratio: 0.62,
        positions: (s, m) => [
            { top: 0, left: Math.round((s - m) / 2) },
            { top: s - m, left: 0 },
            { top: s - m, left: s - m },
        ],
    },
    4: {
        ratio: 0.55,
        positions: (s, m) => [
            { top: 0, left: 0 },
            { top: 0, left: s - m },
            { top: s - m, left: 0 },
            { top: s - m, left: s - m },
        ],
    },
}

function getLayout() {
    return LAYOUTS[slotCount.value] ?? LAYOUTS[4]
}

function getSlotStyle(index, slot) {
    const layout = getLayout()
    const s = normalizedSize.value
    const m = Math.round(s * layout.ratio)
    const { top, left } = layout.positions(s, m)[index]

    const isOverflow = slot.color === null
    const fontSize = isOverflow
        ? `${Math.round(m * 0.30)}px`
        : `${Math.round(m * 0.42)}px`

    return {
        width: `${m}px`,
        height: `${m}px`,
        top: `${top}px`,
        left: `${left}px`,
        backgroundColor: isOverflow ? '#6B7280' : slot.color,
        fontSize,
    }
}

function initial(member) {
    return member.name.trim().charAt(0).toUpperCase()
}
</script>
