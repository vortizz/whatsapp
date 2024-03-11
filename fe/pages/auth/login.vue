<template>
  <div class="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg">
    <form @submit.prevent="onSubmit">
      <div class='flex flex-row gap-1 justify-center items-center'>
        <Icon name="ic:baseline-whatsapp" class='text-teal-600 text-[3rem]' />
        <h1 class='text-2xl uppercase'>Whats#<span class='text-teal-600'>App</span></h1>
      </div>
      <div class="text-center text-lg mt-5">Create or access your WhatsApp account to text your friends.</div>
      <div class="flex flex-col gap-1 mt-6">
        <label class="uppercase text-xs font-semibold">E-mail</label>
        <input
          type="email"
          class="text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none"
          v-model="form.email"
          :class="errors.email ? 'focus:border-red-600' : 'focus:border-teal-600'"
        />
        <span v-show="errors.email" class="text-red-600 text-xs">
          {{ errors.email }}
        </span>
      </div>
      <div class="flex flex-col gap-1 mt-6">
        <label class="uppercase text-xs font-semibold">Password</label>
        <div class='relative'>
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            class="w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none"
            v-model="form.password"
            :class="errors.password ? 'focus:border-red-600' : 'focus:border-teal-600'"
          />
          <button class='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' @click="isPasswordVisible = !isPasswordVisible">
            <Icon v-if="isPasswordVisible" name="mdi:eye-outline" />  
            <Icon v-else name="mdi:eye-off-outline" />
          </button>
        </div>
        <span v-show="errors.password" class="text-red-600 text-xs">
          {{ errors.password }}
        </span>
        
        <button
          type="button"
          class="ml-auto font-semibold text-teal-700 hover:underline duration-300"
        >
          Forgot my password
        </button>
      </div>
      <button
        type="submit"
        class="mt-8 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
      >
        Login
      </button>
      <button
        @click="$router.push('/auth/create-account')"
        type="button"
        class="mt-4 text-lg rounded-md border-2 border-teal-600 w-full py-3 text-teal-600 font-semibold hover:bg-teal-600 hover:text-white duration-300"
      >
        Create an account
      </button>
    </form>
  </div>
  </template>
  
<script>
import * as yup from 'yup'
import { useUserStore } from '../../store/user'

definePageMeta({
  layout: 'auth'
})

export default {
  data() {
    return {
      isPasswordVisible: false,
      form: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: ''
      },
      isLoading: '' 
    }
  },
  computed: {
    schema() {
      return yup.object().shape({
        email: yup.string()
          .required()
          .email(),
        password: yup.string()
          .required()
      })
    }
  },
  watch: {
    form: {
      handler() {
        if (Object.keys(this.errors).some(key => !!this.errors[key])) {
          this.validate()
        }
      },
      deep: true
    }  
  },
  methods: {
    clearError() {
      this.errors = {
        email: '',
        password: ''
      }
    },
    async validate() {
      this.clearError()
      try {
          await this.schema.validate(this.form, { abortEarly: false })
          return true
      } catch (err) {
          err.inner.forEach(error => {
            this.errors[error.path] = error.message
          })
          return false
      }
    },
    async onSubmit() {
      const isValid = await this.validate()
      if (!isValid) {
        return
      }
      const form = JSON.parse(JSON.stringify(this.form))
      const body = {
        email: form.email,
        password: form.password
      }
      this.isLoading = true
      try {
        const data = await useMyFetch('auth/login', { method: 'POST', body })
        if (!data.token) {
          throw new Error('Error')
        }
        const { setUser } = useUserStore()
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          token: data.token
        })
        this.$router.push('')
      } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>
  