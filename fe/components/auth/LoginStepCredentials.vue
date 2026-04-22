<template>
  <form @submit.prevent="submit">
    <div class="flex flex-col gap-1 mt-6">
      <label class="uppercase text-xs font-semibold dark:text-zinc-300">E-mail</label>
      <input
        v-model="form.email"
        type="email"
        class="text-lg border rounded-2xl py-3 px-4 font-medium bg-slate-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:placeholder-zinc-500"
        :class="
          errors.email
            ? 'border-red-500 focus:border-red-600'
            : 'border-slate-300 dark:border-zinc-600 focus:border-teal-600'
        "
      />
      <span v-show="errors.email" class="text-red-600 text-xs">{{ errors.email }}</span>
    </div>

    <div class="flex flex-col gap-1 mt-6">
      <label class="uppercase text-xs font-semibold dark:text-zinc-300">Password</label>
      <div class="relative">
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          class="w-full text-lg border rounded-2xl py-3 pl-4 pr-10 font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:placeholder-zinc-500"
          :class="
            errors.password
              ? 'border-red-500 focus:border-red-600'
              : 'border-zinc-300 dark:border-zinc-600 focus:border-teal-600'
          "
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 px-4 text-slate-400 dark:text-zinc-400"
          @click="showPassword = !showPassword"
        >
          <Icon :name="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'" class="text-lg" />
        </button>
      </div>
      <span v-show="errors.password" class="text-red-600 text-xs">{{ errors.password }}</span>
    </div>

    <button
      type="submit"
      class="mt-8 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
    >
      Login
    </button>
    <button
      type="button"
      class="mt-4 text-lg rounded-md border-2 border-teal-600 w-full py-3 text-teal-600 font-semibold hover:bg-teal-600 hover:text-white duration-300"
      @click="$router.push('/auth/create-account')"
    >
      Create an account
    </button>
  </form>
</template>

<script setup>
  const emit = defineEmits(['next'])

  const form = reactive({ email: '', password: '' })
  const errors = reactive({ email: '', password: '' })
  const showPassword = ref(false)

  function validate() {
    errors.email = ''
    errors.password = ''
    let valid = true

    if (!form.email) {
      errors.email = 'Email is required'
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Must be a valid email'
      valid = false
    }

    if (!form.password) {
      errors.password = 'Password is required'
      valid = false
    }

    return valid
  }

  watch(
    form,
    () => {
      if (Object.values(errors).some(Boolean)) validate()
    },
    { deep: true },
  )

  function submit() {
    if (validate()) emit('next', { ...form })
  }
</script>
