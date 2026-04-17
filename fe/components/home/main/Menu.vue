<template>
  <transition
    enter-active-class="transition ease-out duration-100"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="isMounted && isMenuButton"
      class="absolute z-50 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10 ring-opacity-5 focus:outline-none dark:bg-neutral-900 dark:ring-white/10"
      :class="menuPositionClass"
      :style="menuPositionStyle"
    >
      <HomeMainMenuGroup
        v-if="chatUser.isGroup"
        @close="emit('close')"
        @show-contact-info="emit('showContactInfo')"
      />
      <HomeMainMenuChat
        v-else
        @close="emit('close')"
        @show-contact-info="emit('showContactInfo')"
      />
    </div>
  </transition>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'

  const props = defineProps({
    isMenuButton: {
      type: Boolean,
      default: false,
    },
    x: {
      type: Number,
      default: null,
    },
    y: {
      type: Number,
      default: null,
    },
  })

  const emit = defineEmits(['showContactInfo', 'close'])

  const chatStore = useChatStore()
  const { user: chatUser } = storeToRefs(chatStore)

  const isMounted = ref(false)

  const menuPositionClass = computed(() =>
    props.x === null || props.y === null ? 'right-0 mt-2' : '',
  )
  const menuPositionStyle = computed(() => {
    if (props.x === null || props.y === null) return undefined
    return { left: `${props.x}px`, top: `${props.y}px` }
  })

  onMounted(() => {
    isMounted.value = true
  })
</script>
