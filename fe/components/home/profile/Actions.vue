<template>
  <div class="flex flex-col px-[18px]">
    <div
      class="flex items-center py-3 px-2.5 dark:hover:bg-neutral-800 hover:bg-stone-100 rounded-xl cursor-pointer"
      @click="emit('openProfile')"
    >
      <div class="py-2 pl-2 pr-4 flex items-center">
        <Icon name="mdi:user-circle-outline" class="text-2xl dark:text-white/60" />
      </div>
      <div>
        <div class="dark:text-white text-neutral-950 text-base">Profile</div>
        <div class="dark:text-white/60 text-black/60 text-sm">
          Name, profile photo, about, email
        </div>
      </div>
    </div>
    <div
      class="flex items-center py-3 px-2.5 dark:hover:bg-[#321622] hover:bg-rose-100 rounded-xl cursor-pointer"
      @click="signout"
    >
      <div class="py-2 pl-2 pr-4 flex items-center">
        <Icon
          name="material-symbols:logout-rounded"
          class="text-2xl dark:text-rose-500 text-rose-600"
        />
      </div>
      <div class="dark:text-rose-500 text-rose-600">Log out</div>
    </div>
  </div>
</template>

<script setup>
  import { useUserStore } from '../../../store/user'
  import { useWsStore } from '../../../store/websocket'

  const emit = defineEmits(['openProfile'])

  const router = useRouter()
  const userStore = useUserStore()
  const wsStore = useWsStore()

  const { logout } = userStore
  const { disconnectWs } = wsStore

  function signout() {
    logout()
    disconnectWs()
    router.push('/auth/login')
  }
</script>
