<template>
    <div>
        <div v-if="loading" class="text-center py-[72px] text-sm text-gray-400">
            Looking for users
        </div>
        <div v-else-if="!users.length" class="text-center py-[72px] text-sm text-gray-400">
            No results found for '{{ text }}'
        </div>
        <div v-else class="bg-white">
            <div class="p-7 text-teal-600">
                USERS
            </div>
            <template v-for="(user, i) in users" :key="i">
                <div class="p-7 text-teal-600">
                    {{ user.letter }}
                </div>
                <HomeNewChatUser
                    v-for="u in user.users"
                    :key="u._id"
                    :name="u.name"
                    :about="u.about"
                    @click="setUser(u)"
                />
            </template>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    props: ['text'],
    data() {
        return {
            users: [
            /**
                {
                    letter: 'A',
                    users: [
                        ...
                    ]
                },
                {
                    letter: 'B',
                    users: [
                        ...
                    ]
                }
                */
            ],
            loading: false
        }
    },
    watch: {
        text() {
            this.getUsers()
        }
    },
    mounted() {
        this.getUsers()
    },
    methods: {
        ...mapActions(useChatStore, {
            setChatAction: 'setChat'
        }),
        async getUsers() {
            try {
                this.loading = true
                const query = this.text ? { query: { username: this.text } } : {}
                const users = await useMyAuthFetch('user/new-chat', { method: 'GET', ...query })
                this.users = this.splitByLetter(users.map(user => ({
                    _id: user._id,
                    name: user.name,
                    about: user.about,
                    email: user.email,
                    chat: user.chat?._id ? {
                        _id: user.chat._id,
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            about: user.about
                        }
                    } : null
                })))
            } catch (error) {
                const data = error?.data || {}
                const message = Array.isArray(data.message) ? data.message[0] : data.message
                useNuxtApp().$toast.error(message)
            } finally {
                this.loading = false
            }
        },
        splitByLetter(users) {
            const result = []

            for (const user of users) {
                const firstLetter = user.name.trim().toUpperCase().charAt(0)
                const usersByTheLetter = users.filter(u => 
                    u.name.trim().toUpperCase().charAt(0) === firstLetter && !u.handled
                )

                if (!usersByTheLetter.length) continue

                result.push({
                    letter: firstLetter,
                    users: JSON.parse(JSON.stringify(usersByTheLetter))
                })

                for (const u of usersByTheLetter) {
                    u.handled = true
                }
            }

            return result
        },
        setUser(user) {
            const clonedUser = JSON.parse(JSON.stringify(user))
            this.setChatAction({
                _id: clonedUser.chat?._id || 'new-chat',
                user: clonedUser
            })
            this.$emit('close')
        },
    }
}
</script>

<style>

</style>