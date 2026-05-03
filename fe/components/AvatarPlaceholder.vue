<template>
  <div
    class="inline-flex items-center justify-center rounded-full"
    :class="hasName ? '' : 'bg-stone-200 text-stone-500 dark:bg-white/10 dark:text-white/60'"
    :style="containerStyle"
  >
    <span
      v-if="hasName"
      :style="textStyle"
      class="font-semibold text-white select-none leading-none"
    >
      {{ initials }}
    </span>
    <Icon
      v-else
      :name="group ? 'solar:users-group-rounded-bold' : 'solar:user-bold'"
      :style="iconStyle"
    />
  </div>
</template>

<script setup>
  import { getAvatarColor } from '~/utils/avatar-color'

  const props = defineProps({
    size: {
      type: [Number, String],
      default: 48,
    },
    iconScale: {
      type: Number,
      default: 0.55,
    },
    group: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
  })

  const normalizedSize = computed(() => {
    if (typeof props.size === 'number') {
      return props.size
    }
    const parsedSize = Number.parseInt(props.size, 10)
    return Number.isNaN(parsedSize) ? 48 : parsedSize
  })

  const hasName = computed(() => !!props.name?.trim())

  const initials = computed(() => {
    if (!hasName.value) return ''
    const words = props.name.trim().split(/\s+/)
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  })

  const avatarColor = computed(() => {
    if (!hasName.value) return null
    return getAvatarColor(props.name)
  })

  const containerStyle = computed(() => {
    const style = {
      width: `${normalizedSize.value}px`,
      height: `${normalizedSize.value}px`,
    }
    if (avatarColor.value) {
      style.backgroundColor = avatarColor.value
    }
    return style
  })

  const iconStyle = computed(() => ({
    fontSize: `${Math.round(normalizedSize.value * props.iconScale)}px`,
  }))

  const textStyle = computed(() => ({
    fontSize: `${Math.round(normalizedSize.value * 0.38)}px`,
  }))
</script>
