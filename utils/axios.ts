import axios, { AxiosError, type AxiosInstance } from 'axios';
import { clearAuthSession, isAuthPagePath, isPublicAuthRequest } from '~/utils/authSession';

let redirectingToLogin = false

export function createApiClient(): AxiosInstance {
	const runtimeConfig = useRuntimeConfig();
	const api = axios.create({
		baseURL: String(runtimeConfig.public.apiBaseUrl),
		timeout: 15000,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	api.interceptors.request.use((config) => {
		if (import.meta.client && !isPublicAuthRequest(config.method, config.url)) {
			const token = localStorage.getItem('accessToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	});

	api.interceptors.response.use(
		(response) => {
			const data = response.data;

			if (data?.result === 'ERROR') {
				return Promise.reject({
					type: 'api-error',
					message: data.msg || 'API 오류 발생',
					response: data
				});
			}
			return response;
		},
		(error: AxiosError) => {
			console.log("ER2", error)
			if (
				import.meta.client
				&& error.response?.status === 401
				&& !isPublicAuthRequest(error.config?.method, error.config?.url)
			) {
				clearAuthSession()
				if (!redirectingToLogin && !isAuthPagePath()) {
					redirectingToLogin = true
					navigateTo('/login').finally(() => {
						redirectingToLogin = false
					})
				}
			}
			return Promise.reject(error);
		}
	);

	return api;
}
