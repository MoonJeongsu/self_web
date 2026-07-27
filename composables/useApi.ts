import { api } from '@/utils/axios';
import { formatApiError } from '@/utils/apiError';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseApiOptions<T = any> {
	method?: ApiMethod;
	data?: T; // POST/PUT body
	params?: Record<string, any>; // query params
	headers?: Record<string, string>;
}

export async function useApi<TResponse = any, TRequest = any>(
		url: string,
		options: UseApiOptions<TRequest> = {}
	): Promise<{ data: TResponse | null; error: any }> {
		try {
			const accessToken = import.meta.client
				? localStorage.getItem('accessToken')
				: null

			const isFormData = typeof FormData !== 'undefined' && options.data instanceof FormData
			const headers: Record<string, string | undefined> = {
				...(options.headers || {}),
				Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
			}
			if (isFormData) {
				headers['Content-Type'] = undefined
			}

			const response = await api.request<TResponse>({
				url,
				method: options.method || 'GET',
				data: options.data,
				params: options.params,
				headers,
			});
		
			return {
				data: response.data,
				error: null
			};
		} catch (error: any) {
		if (error?.type === 'api-error') {
			return {
				data: null,
				error: { msg: error.message || 'API 오류 발생' },
			}
		}

		const status = error?.response?.status
		return {
			data: null,
			error: {
				msg: formatApiError(error),
				status,
			},
		};
	}
}