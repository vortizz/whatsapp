<template>
  <div
    class="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg dark:bg-zinc-900"
  >
    <form @submit.prevent="onSubmit">
      <div class="flex flex-row gap-1 justify-center items-center">
        <Icon name="ic:baseline-whatsapp" class="text-teal-600 text-[3rem]" />
        <h1 class="text-2xl uppercase dark:text-zinc-300">
          Whats#<span class="text-teal-600">App</span>
        </h1>
      </div>
      <div class="text-center text-lg mt-5 dark:text-zinc-300">
        Create or access your WhatsApp account to text your friends.
      </div>
      <div class="flex flex-col gap-1 mt-6">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">E-mail</label>
        <input
          v-model="form.email"
          type="email"
          class="text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:placeholder-zinc-500"
          :class="errors.email ? 'focus:border-red-600' : 'focus:border-teal-600'"
        />
        <span v-show="errors.email" class="text-red-600 text-xs">
          {{ errors.email }}
        </span>
      </div>
      <div class="flex flex-col gap-1 mt-6">
        <label class="uppercase text-xs font-semibold dark:text-zinc-300">Password</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="isPasswordVisible ? 'text' : 'password'"
            class="w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:placeholder-zinc-500"
            :class="errors.password ? 'focus:border-red-600' : 'focus:border-teal-600'"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 text-slate-400 px-4 text-lg dark:text-zinc-400"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            <Icon v-if="isPasswordVisible" name="mdi:eye-outline" />
            <Icon v-else name="mdi:eye-off-outline" />
          </button>
        </div>
        <span v-show="errors.password" class="text-red-600 text-xs">
          {{ errors.password }}
        </span>
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
  </div>
</template>

<script setup>
  import * as yup from 'yup'
  import { reactive, ref, computed, watch } from 'vue'
  import { useUserStore } from '../../store/user'
  import { useWsStore } from '../../store/websocket'

  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  })

  const userStore = useUserStore()
  const wsStore = useWsStore()
  const { initKeys } = useCrypto()

  const isPasswordVisible = ref(false)
  const isLoading = ref(false)

  const form = reactive({
    email: '',
    password: '',
  })

  const errors = reactive({
    email: '',
    password: '',
  })

  const schema = computed(() =>
    yup.object().shape({
      email: yup.string().required().email(),
      password: yup.string().required(),
    }),
  )

  function clearError() {
    errors.email = ''
    errors.password = ''
  }

  async function validate() {
    clearError()

    try {
      await schema.value.validate(form, { abortEarly: false })
      return true
    } catch (err) {
      err.inner.forEach((error) => {
        errors[error.path] = error.message
      })
      return false
    }
  }

  watch(
    form,
    async () => {
      if (Object.values(errors).some(Boolean)) {
        await validate()
      }
    },
    { deep: true },
  )

  async function onSubmit() {
    const isValid = await validate()
    if (!isValid) return

    const body = {
      email: form.email,
      password: form.password,
    }

    isLoading.value = true

    try {
      const data = await useMyFetch('auth/login', {
        method: 'POST',
        body,
      })

      if (!data.token) {
        throw new Error('Error')
      }

      userStore.setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        about: data.about,
        token: data.token,
        blockedUsers: data.blockedUsers || [],
      })

      wsStore.connectWs({ token: data.token })

      await initKeys(data._id)

      await useRouter().push('/')
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message

      useNuxtApp().$toast.error(message)
    } finally {
      isLoading.value = false
    }
  }
</script>
