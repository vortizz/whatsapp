<template>
  <div
    ref="targetEl"
    class="inline-block relative"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />

    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-100 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-show="show"
        ref="tooltipEl"
        :style="{ left: tooltipPos.left + 'px', top: tooltipPos.top + 'px' }"
        class="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none bg-neutral-800 text-white shadow-lg dark:bg-neutral-700"
      >
        {{ text }}
        <span
          class="absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45"
          :style="arrowStyle"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, nextTick } from 'vue'

  const props = defineProps({
    text: { type: String, required: true },
    spacing: { type: Number, default: 6 },
  })

  const show = ref(false)
  const tooltipPos = ref({ left: 0, top: 0 })
  const arrowStyle = ref({})
  const targetEl = ref(null)
  const tooltipEl = ref(null)

  const updatePosition = () => {
    if (!targetEl.value || !tooltipEl.value) return

    const targetRect = targetEl.value.getBoundingClientRect()
    const tooltipRect = tooltipEl.value.getBoundingClientRect()
    const targetCenter = targetRect.left + targetRect.width / 2

    let left = targetCenter - tooltipRect.width / 2
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))

    const showAbove = targetRect.top >= tooltipRect.height + props.spacing + 8

    const top = showAbove
      ? targetRect.top - tooltipRect.height - props.spacing
      : targetRect.bottom + props.spacing

    const arrowLeft = Math.max(8, Math.min(targetCenter - left - 4, tooltipRect.width - 16))

    tooltipPos.value = { left, top }
    arrowStyle.value = showAbove
      ? { left: arrowLeft + 'px', bottom: '-4px' }
      : { left: arrowLeft + 'px', top: '-4px' }
  }

  const showTooltip = async () => {
    show.value = true
    await nextTick()
    updatePosition()
  }

  const hideTooltip = () => {
    show.value = false
  }
</script>
