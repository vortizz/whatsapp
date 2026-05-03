<template>
  <div>
    <div v-if="loading" class="text-center py-[72px] text-sm text-black/60">Looking for users</div>
    <div
      v-else-if="!users.length"
      class="text-center py-[72px] text-sm text-black/60 dark:text-white/60"
    >
      No results found for '{{ text }}'
    </div>
    <div v-else>
      <template v-for="(user, i) in users" :key="i">
        <div class="capitalize pt-10 pb-4 pl-7 text-black/60 dark:text-white/60 text-sm">
          {{ user.letter }}
        </div>
        <HomeNewChatUser
          v-for="u in user.users"
          :key="u._id"
          :name="u.name"
          :about="u.about"
          @select-user="setUser(u)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const props = defineProps(['text'])
  const emit = defineEmits(['close'])

  const chatStore = useChatStore()
  const userStore = useUserStore()

  const users = ref([])
  const loading = ref(false)

  watch(
    () => props.text,
    () => {
      getUsers()
    },
  )

  onMounted(() => {
    getUsers()
  })

  async function getUsers() {
    try {
      loading.value = true
      const query = props.text ? { query: { username: props.text } } : {}
      const result = await useMyAuthFetch('user/new-chat', { method: 'GET', ...query })
      users.value = splitByLetter(
        result.map((user) => ({
          _id: user._id,
          name: user.name,
          about: user.about,
          email: user.email,
          isConnected: user.isConnected,
          lastSeenAt: user.lastSeenAt,
          publicKey: user.publicKey,
          chat: user.chat?._id
            ? {
                _id: user.chat._id,
                // user: {
                //   _id: user._id,
                //   name: user.name,
                //   email: user.email,
                //   about: user.about,
                //   isConnected: user.isConnected,
                //   lastSeenAt: user.lastSeenAt,
                //   publicKey: user.publicKey,
                // },
                createdAt: user.chat.createdAt,
                encryptedKeys: user.chat.encryptedKeys,
              }
            : null,
        })),
      )
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      loading.value = false
    }
  }

  function splitByLetter(users) {
    const result = []

    for (const user of users) {
      const firstLetter = user.name.trim().toUpperCase().charAt(0)
      const usersByTheLetter = users.filter(
        (u) => u.name.trim().toUpperCase().charAt(0) === firstLetter && !u.handled,
      )

      if (!usersByTheLetter.length) continue

      result.push({
        letter: firstLetter,
        users: JSON.parse(JSON.stringify(usersByTheLetter)),
      })

      for (const u of usersByTheLetter) {
        u.handled = true
      }
    }

    return result
  }

  function setUser({ chat, ...user }) {
    chatStore.setChat({
      _id: chat?._id || 'new-chat',
      users: [
        {
          _id: userStore._id,
          name: userStore.name,
          about: userStore.about,
          email: userStore.email,
          isConnected: userStore.isConnected,
          lastSeenAt: userStore.lastSeenAt,
        },
        user,
      ],
      createdAt: chat?.createdAt,
      encryptedKeys: chat?.encryptedKeys,
    })
    emit('close')
  }
</script>

<style></style>
