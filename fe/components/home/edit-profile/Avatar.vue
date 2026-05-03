<template>
  <AvatarPlaceholder :size="128" :name="userName" class="ml-auto mr-auto" />
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useUserStore } from '~/store/user'

  const userStore = useUserStore()
  const { name: userName } = storeToRefs(userStore)
</script>
