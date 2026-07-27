import { useApi } from '../useApi'
import type { ProfileUserType, SignInType, SignupRequestType } from '~/types'
import { pickToken, pickUserInfo, unwrapApiData } from '~/utils/apiResponse'

function storeSession(token: string, userInfo?: ProfileUserType) {
	const accessTokenCookie = useCookie('accessToken', {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})
	if (import.meta.client) {
		localStorage.setItem('accessToken', token)
	}
	accessTokenCookie.value = token

	if (userInfo) {
		const userInfoCookie = useCookie<ProfileUserType>('userInfo', {
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		})
		userInfoCookie.value = userInfo
	}
}

export namespace mainApi {
	export async function login(body: SignInType) {
		const { data, error } = await useApi('/v1/user/login', {
			method: 'POST',
			data: body,
		})
		if (error) throw error

		const token = pickToken(data)
		if (!token) {
			throw { msg: '로그인 토큰을 받지 못했습니다.' }
		}

		let userInfo = pickUserInfo(data) as ProfileUserType | undefined
		storeSession(token)

		if (!userInfo?.name) {
			userInfo = await fetchProfileUser()
		} else {
			storeSession(token, userInfo)
		}

		return { token, userInfo }
	}

	export async function idCheck(loginId: String) {
		const { data, error } = await useApi('/v1/user/id/check', {
			method: 'POST',
			data: { loginId },
		})
		if (error) throw error
		return data
	}

	export async function updateFcm(form: Object) {
		const { data, error } = await useApi('/v1/user/fcm', {
			method: 'POST',
			data: form,
		})
		if (error) throw error
		return data
	}

	export async function signup(body: SignupRequestType) {
		const { data, error } = await useApi('/v1/user/signup', {
			method: 'POST',
			data: body,
		})
		if (error) throw error
		return data
	}

	export async function getProfile() {
		return fetchProfileUser()
	}
}

async function fetchProfileUser(): Promise<ProfileUserType> {
	const { data, error } = await useApi('/v1/user')
	if (error) throw error

	const userInfo = (unwrapApiData<ProfileUserType>(data) ?? pickUserInfo(data)) as ProfileUserType
	const token = pickToken(data)
	if (token) {
		storeSession(token, userInfo)
	} else if (userInfo) {
		const userInfoCookie = useCookie<ProfileUserType>('userInfo', {
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		})
		userInfoCookie.value = userInfo
	}

	return userInfo
}
