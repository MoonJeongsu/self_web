/** 백엔드 { result, data } 래퍼 또는 flat 응답 모두 처리 */
export function unwrapApiData<T>(payload: unknown): T {
	if (!payload || typeof payload !== 'object') {
		return payload as T
	}
	const body = payload as { result?: string; data?: T }
	if (body.result !== undefined && body.data !== undefined) {
		return body.data
	}
	return payload as T
}

export function pickToken(payload: unknown): string | undefined {
	if (!payload || typeof payload !== 'object') return undefined
	const body = payload as { token?: string; data?: { token?: string } }
	return body.token ?? body.data?.token
}

export function pickUserInfo(payload: unknown) {
	if (!payload || typeof payload !== 'object') return undefined
	const body = payload as { userInfo?: unknown; data?: { userInfo?: unknown } }
	return body.userInfo ?? body.data?.userInfo ?? body
}

export function pickSelfTestId(payload: unknown): string | number | undefined {
	if (!payload || typeof payload !== 'object') return undefined
	const body = payload as { selfTestId?: string | number; data?: { selfTestId?: string | number } }
	return body.selfTestId ?? body.data?.selfTestId
}
