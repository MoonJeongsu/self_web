import { api } from '@/utils/axios';

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
			// 자동으로 accessToken 쿠키에서 읽어오기
			const accessToken = localStorage.getItem('accessToken')

			const response = await api.request<TResponse>({
				url,
				method: options.method || 'GET',
				data: options.data,
				params: options.params,
				headers: {
					...(options.headers || {}),
					Authorization: accessToken ? `Bearer ${accessToken}` : undefined
				}
			});
		
			return {
				data: response.data,
				error: null
			};
		} catch (error: any) {
		return {
			data: null,
			error: error.response?.data || error.message
		};
	}
}