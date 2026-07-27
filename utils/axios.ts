// utils/axios.ts
import axios, { AxiosError } from 'axios';

export const api = axios.create({
	baseURL: 'https://smartjaga.gongjak.dev/smart-jaga-api',
	timeout: 15000,
	headers: {
		'Content-Type': 'application/json'
	}
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken")
	if (token) {
	  config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

//응답 공통 에러 처리
api.interceptors.response.use(
	// 성공 
	(response) => {
		const data = response.data;
	  
		if (data?.result === 'ERROR') {
			// 서버 응답이 있지만 API 레벨 에러일 때
			return Promise.reject({
				type: 'api-error',
				message: data.msg || 'API 오류 발생',
				response: data
			});
		} 
		return response;
	},
	// 실패 
	(error: AxiosError) => {
		console.log("ER2", error)
		// 네트워크 또는 서버 오류
		return Promise.reject(error);
	}
);
  