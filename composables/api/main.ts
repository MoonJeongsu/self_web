import { useApi } from "../useApi";
import type {SignInType, UserInfoType} from '~/types'

export namespace mainApi {
	//로그인
	export async function login(body: SignInType) {
		const { data, error } = await useApi('/v1/user/login', {
			method: 'POST',
			data: body
		})
		if (error) throw error;
		const userInfoCookie = useCookie<typeof data>('userInfo', {
			maxAge: 60 * 60 * 24 * 7, // 7일
			path: '/'
		})
		userInfoCookie.value = data.userInfo;
		const accessTokenCookie = useCookie('accessToken', {
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})
		localStorage.setItem("accessToken", data.token)
		accessTokenCookie.value = data.token;
  		return data;
	}
	//아이디 체크
	export async function idCheck(loginId: String) {
		const { data, error } = await useApi('/v1/user/id/check', {
			method: 'POST',
			data: {
				loginId
			}
		})
		
		if (error) throw error;

  		return data;
	}

	export async function updateFcm(form: Object) {
		const { data, error } = await useApi('/v1/user/fcm', {
			method: 'POST',
			data: form
		})
		
		if (error) throw error;

  		return data;
	}

	

	//회원가입
	export async function signup(body: UserInfoType) {
		const { data, error } = await useApi('/v1/user/signup', {
			method: 'POST',
			data: body
		})

		if (error) throw error;

  		return data;
	}
	//회원정보 조회
	export async function getProfile() {
		const { data, error } = await useApi('/v1/user')
		if (error) throw error;
  		return data;
	}
}