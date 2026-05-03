<template>
  <div aria-label="add-group-members">
    <!-- Selected chips + search input -->
    <div class="px-5 pb-3 pt-6 bg-white dark:bg-neutral-900 flex flex-wrap gap-1.5 items-center">
      <div
        v-for="user in selected"
        :key="user._id"
        class="flex items-center gap-2 rounded-full px-2 py-1"
        :aria-label="`selected-${user.name}`"
      >
        <AvatarPlaceholder :size="26" :name="user.name" />
        <span class="text-base text-neutral-950 dark:text-white">{{ user.name }}</span>
        <button
          class="flex items-center p-0.5 text-black/60 dark:text-white/60 hover:bg-stone-400/15 rounded-full"
          @click="emit('deselect', user)"
        >
          <Icon name="material-symbols:close" class="text-2xl" />
        </button>
      </div>
    </div>
    <div class="w-full px-7 mt-2">
      <input
        aria-label="group-search"
        type="text"
        :placeholder="selected?.length ? '' : 'Search name or number'"
        class="w-full bg-transparent text-sm border-b border-black/10 dark:border-white/10 placeholder:text-black/60 dark:placeholder:text-white/60 p-0.5 outline-none"
        :value="text"
        @input="debouncedInput"
      />
    </div>

    <!-- User list -->
    <div class="bg-white dark:bg-neutral-900 flex-1">
      <div v-if="loading" class="text-center py-[72px] text-sm text-black/60">
        Looking for users
      </div>
      <div v-else-if="!users.length" class="text-center py-[72px] text-sm text-black/60">
        No results found
      </div>
      <div v-else>
        <template v-for="(group, i) in users" :key="i">
          <div class="capitalize pt-10 pb-4 pl-7 text-black/60 dark:text-white/60 text-sm">
            {{ group.letter }}
          </div>
          <div
            v-for="u in group.users"
            :key="u._id"
            class="flex flex-row mx-2.5 px-3.5 pt-3.5 gap-3.5 hover:bg-stone-400/15 rounded-xl group cursor-pointer"
            :class="isSelected(u) ? 'bg-stone-400/10' : ''"
            :aria-label="u.name"
            @click="toggle(u)"
          >
            <div class="relative">
              <AvatarPlaceholder :size="48" :name="u.name" />
              <div
                v-if="isSelected(u)"
                class="absolute bottom-2 -right-1 bg-emerald-500 rounded-full text-white flex items-center justify-center w-5 h-5"
              >
                <Icon name="material-symbols:check" class="text-sm" />
              </div>
            </div>
            <div class="flex-1 flex flex-col justify-center pb-3.5">
              <div
                class="text-base max-h-6 text-neutral-950 grow text-ellipsis overflow-hidden dark:text-white"
              >
                {{ u.name }}
              </div>
              <div
                class="text-sm text-black/60 dark:text-white/60 grow max-h-5 text-ellipsis overflow-hidden"
              >
                {{ u.about }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps(['selected'])
  const emit = defineEmits(['select', 'deselect'])

  const text = ref('')
  const users = ref([])
  const loading = ref(false)
  const debouncedInput = debounce((e) => {
    text.value = e.target.value
  }, 500)

  watch(text, () => getUsers())

  onMounted(() => getUsers())

  function isSelected(user) {
    return props.selected.some((s) => s._id === user._id)
  }

  function toggle(user) {
    if (isSelected(user)) {
      emit('deselect', user)
    } else {
      emit('select', user)
    }
  }

  async function getUsers() {
    try {
      loading.value = true
      const query = text.value ? { query: { username: text.value } } : {}
      const result = await useMyAuthFetch('user/new-chat', { method: 'GET', ...query })
      users.value = splitByLetter(
        result.map((u) => ({
          _id: u._id,
          name: u.name,
          about: u.about,
          publicKey: u.publicKey,
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

  function splitByLetter(list) {
    const result = []
    for (const user of list) {
      const firstLetter = user.name.trim().toUpperCase().charAt(0)
      const byLetter = list.filter(
        (u) => u.name.trim().toUpperCase().charAt(0) === firstLetter && !u.handled,
      )
      if (!byLetter.length) continue
      result.push({ letter: firstLetter, users: JSON.parse(JSON.stringify(byLetter)) })
      for (const u of byLetter) u.handled = true
    }
    return result
  }
</script>
