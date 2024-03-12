import { useUserStore } from '../store/user'

export const useMyFetch = (request: string, opts?: any) => {
    const config = useRuntimeConfig()
    return $fetch(request, { baseURL: config.public.baseUrlApi, ...opts })
}

export const useMyAuthFetch = async (request: string, opts?: any) => {
    try {
        const config = useRuntimeConfig()
        const headers = { Authorization: `Bearer ${useCookie('token').value}` }
        return await $fetch(request, { baseURL: config.public.baseUrlApi, ...{ headers }, ...opts })
    } catch (error: any) {
        if (error?.status === 401) {
            const userStore = useUserStore()
            userStore.logout()
            setTimeout(() => {
                useNuxtApp().$toast.error('Token has expired. Please login again!')
            }, 100)
            return useRouter().push('/auth/login')
        }
        throw error
    }
}