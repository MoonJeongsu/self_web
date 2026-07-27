import { api } from '@/utils/axios'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	api.defaults.baseURL = config.public.apiBaseUrl
})
