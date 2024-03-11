export const useMyFetch = (request: string, opts?: any) => {
    const config = useRuntimeConfig()
    return $fetch(request, { baseURL: config.public.baseUrlApi, ...opts })
}