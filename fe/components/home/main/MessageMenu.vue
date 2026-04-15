<template>
  <div class="absolute right-1 top-1 z-10">
    <button
      ref="btnRef"
      type="button"
      class="flex items-center rounded-full p-0.5 opacity-0 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
      :class="buttonClass"
      @click.stop="handleToggle"
    >
      <Icon name="mdi:chevron-down" class="text-[22px]" />
    </button>
    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <div
        v-if="isMenuOpen"
        class="absolute w-52 rounded-xl bg-white shadow-lg ring-1 ring-black/10 ring-opacity-5 dark:bg-neutral-900 dark:ring-white/10 p-1"
        :class="menuPositionClass"
      >
        <button @click.stop="reply" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
          <Icon class="text-base" name="mdi:reply" />
          Reply
        </button>
        <template v-if="isGroup">
          <button @click.stop="replyPrivately" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
            <Icon class="text-base" name="mdi:reply-outline" />
            Reply privately
          </button>
          <button @click.stop="messageUser" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
            <Icon class="text-base" name="mdi:message-outline" />
            Message {{ senderName }}
          </button>
        </template>
        <button @click.stop="copyText" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
          <Icon class="text-base" name="mdi:content-copy" />
          Copy
        </button>
        <button @click.stop="enterForward" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
          <Icon class="text-base" name="mdi:share" />
          Forward
        </button>
        <button v-if="isMine" @click.stop="messageInfo" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
          <Icon class="text-base" name="mdi:information-outline" />
          Message info
        </button>
        <button @click.stop="enterSelect" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-rose-600/10 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-3 rounded-xl dark:text-zinc-50 text-sm">
          <Icon class="text-base" name="line-md:trash" />
          Delete
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps(['_id', 'text', 'isMenuOpen', 'buttonClass', 'isGroup', 'senderName', 'isMine'])
const emit = defineEmits(['toggle-menu', 'enter-select', 'enter-forward', 'reply', 'reply-privately', 'message-user', 'message-info'])

const btnRef = ref(null)
const menuPos = ref({ vertical: 'bottom', horizontal: 'right' })

const MENU_WIDTH = 160
const MENU_HEIGHT = 90

const menuPositionClass = computed(() => ({
  'top-7': menuPos.value.vertical === 'bottom',
  'bottom-7': menuPos.value.vertical === 'top',
  'left-0': menuPos.value.horizontal === 'right',
  'right-0': menuPos.value.horizontal === 'left',
}))

function calcMenuPos(clientX, clientY, target) {
  const pane = target.closest('[class*="overflow-y-auto"]')
  const bottomBoundary = pane ? pane.getBoundingClientRect().bottom : window.innerHeight
  return {
    vertical: bottomBoundary - clientY >= MENU_HEIGHT ? 'bottom' : 'top',
    horizontal: window.innerWidth - clientX >= MENU_WIDTH ? 'right' : 'left',
  }
}

function handleToggle() {
  if (!props.isMenuOpen && btnRef.value) {
    const rect = btnRef.value.getBoundingClientRect()
    menuPos.value = calcMenuPos(rect.right, rect.bottom, btnRef.value)
  }
  emit('toggle-menu')
}

function open() {
  if (!props.isMenuOpen && btnRef.value) {
    const rect = btnRef.value.getBoundingClientRect()
    menuPos.value = calcMenuPos(rect.right, rect.bottom, btnRef.value)
  }
  emit('toggle-menu')
}

function copyText() {
  navigator.clipboard.writeText(props.text)
  emit('toggle-menu')
}

function enterSelect() {
  emit('enter-select', props._id)
  emit('toggle-menu')
}

function enterForward() {
  emit('enter-forward', props._id)
  emit('toggle-menu')
}

function reply() {
  emit('reply')
  emit('toggle-menu')
}

function replyPrivately() {
  emit('reply-privately')
  emit('toggle-menu')
}

function messageUser() {
  emit('message-user')
  emit('toggle-menu')
}

function messageInfo() {
  emit('message-info')
  emit('toggle-menu')
}

defineExpose({ open })
</script>
