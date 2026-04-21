<template>
  <div>
    <span class="text-center text-lg mt-5 inline-block dark:text-zinc-300">
      Create your account to get started.
    </span>

    <div class="flex flex-col mt-6 gap-5">
      <!-- Name -->
      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="text-lg border rounded-2xl py-3 px-4 font-medium bg-slate-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
          :class="
            errors.name
              ? 'border-red-500 dark:border-red-500'
              : 'border-slate-300 focus:border-teal-600 dark:border-zinc-600'
          "
        />
        <span v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</span>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">E-mail</label>
        <input
          v-model="form.email"
          type="email"
          class="text-lg border rounded-2xl py-3 px-4 font-medium bg-slate-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
          :class="
            errors.email
              ? 'border-red-500 dark:border-red-500'
              : 'border-slate-300 focus:border-teal-600 dark:border-zinc-600'
          "
        />
        <span v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</span>
      </div>

      <!-- Password -->
      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Password</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full text-lg border rounded-2xl py-3 pl-4 pr-12 font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
            :class="
              errors.password
                ? 'border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-teal-600 dark:border-zinc-600'
            "
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-4 text-slate-400 dark:text-zinc-400"
            @click="showPassword = !showPassword"
          >
            <Icon
              :name="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="text-lg"
            />
          </button>
        </div>
        <span v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</span>
      </div>

      <!-- Confirm Password -->
      <div class="flex flex-col gap-1">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Confirm Password</label>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="w-full text-lg border rounded-2xl py-3 pl-4 pr-12 font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-700"
            :class="
              errors.confirmPassword
                ? 'border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-teal-600 dark:border-zinc-600'
            "
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-4 text-slate-400 dark:text-zinc-400"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon
              :name="showConfirmPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="text-lg"
            />
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="text-red-500 text-xs">{{
          errors.confirmPassword
        }}</span>
      </div>
    </div>

    <button
      type="button"
      class="mt-7 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
      @click="submit"
    >
      Next
    </button>
  </div>
</template>

<script setup>
  const emit = defineEmits(['next'])

  const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
  const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' })
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  function submit() {
    errors.name = ''
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''

    let valid = true

    if (!form.name.trim()) {
      errors.name = 'Name is required'
      valid = false
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required'
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email'
      valid = false
    }
    if (!form.password) {
      errors.password = 'Password is required'
      valid = false
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
      valid = false
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      valid = false
    }

    if (valid) emit('next', { name: form.name, email: form.email, password: form.password })
  }
</script>
