<template>
    <div class="flex flex-col gap-3">
        <div class="bg-white px-7 pt-3.5 pb-2.5 shadow-sm flex flex-col gap-5">
            <label class="text-sm text-teal-700">
                Your name
            </label>
            <div
                v-if="!isEditing"
                class="flex flex-row justify-between items-center"
            >
                <span>
                    {{ name }}
                </span>
                <button class="text-2xl text-gray-400" @click="startEditing">
                    <Icon name="ic:round-edit" />
                </button>
            </div>
            <div v-else class="relative">
                <form @submit.prevent="submit">
                    <input
                        ref="rname"
                        type="text"
                        v-model="text"
                        maxlength="25"
                        class="w-full py-1.5 pr-14 border-b-2 border-gray-700 focus:outline-none focus:border-teal-700"
                    >
                    <div v-if="!loading" class="text-2xl text-gray-400 absolute right-0 inset-y-0 flex flex-row gap-0.5">
                        <button class="text-2xl text-gray-400" @click="stopEditing">
                            <Icon name="material-symbols:close" />
                        </button>
                        <button type="submit" :disabled="disabledSubmit" class="text-2xl text-gray-400">
                            <Icon name="material-symbols:check" />
                        </button>
                    </div>
                    <div v-else class="absolute right-0 inset-y-0 text-gray-400">
                        <svg aria-hidden="true" role="status" class="inline w-5 h-5 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                        </svg>
                    </div>
                </form>
            </div>
        </div>
        <div class="text-sm font-light px-7 text-gray-500">
            This is not your username or pin. This name will be visible to your WhatsApp contacts.
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useUserStore } from '../../../store/user'

export default {
    data() {
        return {
            isEditing: false,
            text: '',
            loading: false
        }
    },
    computed: {
        ...mapState(useUserStore, ['_id', 'name']),
        disabledSubmit() {
            return this.isEditing && this.text === ''   
        }
    },
    methods: {
        ...mapActions(useUserStore, ['setName']),
        startEditing() {
            this.text = this.name.slice()
            this.isEditing = true
        },
        stopEditing() {
            this.text = ''
            this.isEditing = false
        },
        async submit() {
            try {
                this.loading = true
                const name = this.text.slice()
                await useMyAuthFetch('user', {
                    method: 'PUT',
                    body: { _id: this._id, name },
                })
                this.setName(name)
                this.stopEditing()
            } catch (error) {
                const data = error?.data || {}
                const message = Array.isArray(data.message) ? data.message[0] : data.message
                useNuxtApp().$toast.error(message)    
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style>

</style>