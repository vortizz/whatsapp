<template>
  <div class="text-neutral-950 dark:text-white text-xl pl-5 py-3">
    {{ name }}
  </div>
</template>

<script setup>
  import { useUserStore } from '../../../store/user'

  const userStore = useUserStore()

  const name = computed(() => userStore?.name)
</script>
