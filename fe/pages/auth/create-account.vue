<template>
    <div class="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg relative">
        <form @submit.prevent="onSubmit">
            <button
                @click="isLoading ? () => {} : $router.push('/auth/login')"
                type="button"
                class="absolute -left-3 -top-3 p-2 rounded-full border-2 border-teal-600 bg-teal-600 text-white font-semibold hover:bg-teal-700 duration-300"
            >
                <Icon name="ep:back" class="text-2xl" />
            </button>
            <div class='flex flex-row gap-1 justify-center items-center'>
                <Icon name="ic:baseline-whatsapp" class='text-teal-600 text-[3rem]' />
                <h1 class='text-2xl uppercase'>Whats#<span class='text-teal-600'>App</span></h1>
            </div>
            <span class="text-center text-lg mt-5 inline-block">
                Create your WhatsApp account to start your journey.
            </span>
        
            <div class="flex flex-col mt-6 gap-6">
                <div class="flex flex-col gap-1">
                    <label for="name" class="uppercase text-xs font-semibold">Name</label>
                    <input
                        name="name"
                        type="text"
                        class='text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600'
                        :class="errors.name ? 'focus:border-red-600' : 'focus:border-teal-600'"
                        v-model="form.name"
                    />
                    <span v-show="errors.name" class="text-red-600 text-xs">
                        {{ errors.name }}
                    </span>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="email" class="uppercase text-xs font-semibold">E-mail</label>
                    <input
                        name="email"
                        type="email"
                        class='text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600'
                        :class="errors.email ? 'focus:border-red-600' : 'focus:border-teal-600'"
                        v-model="form.email"
                    />
                    <span v-show="errors.email" class="text-red-600 text-xs">
                        {{ errors.email }}
                    </span>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="password" class="uppercase text-xs font-semibold">Password</label>
                    <div class='relative'>
                        <input
                            name="password"
                            :type="isPasswordVisible ? 'text' : 'password'"
                            class='w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none focus:border-teal-600'
                            :class="errors.password ? 'focus:border-red-600' : 'focus:border-teal-600'"
                            v-model="form.password"
                        />
                        <button type="button" class='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' @click="isPasswordVisible = !isPasswordVisible">
                            <Icon v-if="isPasswordVisible" name="mdi:eye-outline" />  
                            <Icon v-else name="mdi:eye-off-outline" />
                        </button>
                    </div>
                    <span v-show="errors.password" class="text-red-600 text-xs">
                        {{ errors.password }}
                    </span>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="confirmPassword" class="uppercase text-xs font-semibold">Confirm Password</label>
                    <div class='relative'>
                        <input
                            name="confirmPassword"
                            :type="isConfirmPasswordVisible ? 'text' : 'password'"
                            class="w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none focus:border-teal-600"
                            :class="errors.confirmPassword ? 'focus:border-red-600' : 'focus:border-teal-600'"
                            v-model="form.confirmPassword"
                        />
                        <button type="button" class='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' @click="isConfirmPasswordVisible = !isConfirmPasswordVisible">
                            <Icon v-if="isConfirmPasswordVisible" name="mdi:eye-outline" />  
                            <Icon v-else name="mdi:eye-off-outline" />
                        </button>
                    </div>
                    <span v-show="errors.confirmPassword" class="text-red-600 text-xs">
                        {{ errors.confirmPassword }}
                    </span>
                </div>
            </div>
            <button
                v-if="!isLoading"
                type="submit"
                class="mt-7 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
            >
                Register
            </button>
            <button
                v-else  
                type="submit"
                disabled
                class="mt-7 text-lg text-center rounded-md bg-teal-700 w-full py-3 text-white font-semibold"
            >
                <svg aria-hidden="true" role="status" class="inline w-5 h-5 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                </svg>
                Loading...
            </button>
        </form>
    </div>
</template>

<script>
import * as yup from 'yup'

definePageMeta({
    layout: 'auth',
    middleware: 'auth'
})

export default {
    data() {
        return {
            isPasswordVisible: false,
            isConfirmPasswordVisible: false,
            isLoading: false,
            form: {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
            errors: {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
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
    computed: {
        schema() {
            return yup.object().shape({
                name: yup.string()  
                    .required(),
                email: yup.string()
                    .required()
                    .email(),
                password: yup.string()
                    .required(),
                    // .matches(
                    //     /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/,
                    //     'password must be strong'
                    // ),
                confirmPassword: yup.string()
                    .required()
                    .oneOf([yup.ref('password'), null], 'password does not match')
            })
        }
    },
    methods: {
        clearError() {
            this.errors = {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
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
                name: form.name,
                email: form.email,
                password: form.password
            }
            this.isLoading = true
            try {
                await useMyFetch('user', { method: 'POST', body })
                setTimeout(() => {
                    useNuxtApp().$toast.success('Successfully registered user')
                }, 100);
                this.$router.push('/auth/login')
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

<style>

</style>