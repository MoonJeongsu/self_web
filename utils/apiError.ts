function isHtmlResponse(value: unknown): value is string {
	return typeof value === 'string'
		&& (value.includes('<!DOCTYPE') || value.includes('<html'))
}

function isAxiosStatusMessage(message: string): boolean {
	return /^Request failed with status code \d+$/.test(message)
		|| /^Network Error$/.test(message)
}

function messageByStatus(status?: number): string | null {
	if (!status) return null
	if (status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.'
	if (status === 403) return '접근이 거부되었습니다. 로그인 상태를 확인해주세요.'
	if (status === 404) return '요청한 API를 찾을 수 없습니다.'
	if (status >= 500) return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
	return `서버 오류가 발생했습니다. (${status})`
}

export function formatApiError(error: unknown): string {
	if (!error) return '요청 처리 중 오류가 발생했습니다.'

	if (typeof error === 'string') {
		if (isHtmlResponse(error)) return '서버 오류가 발생했습니다.'
		if (isAxiosStatusMessage(error)) return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
		return error
	}

	if (typeof error === 'object') {
		const e = error as {
			type?: string
			message?: string
			msg?: string
			status?: number
			response?: { status?: number; data?: unknown }
		}

		if (e.type === 'api-error' && e.message) {
			return e.message
		}

		if (typeof e.msg === 'string' && e.msg) {
			if (isAxiosStatusMessage(e.msg)) {
				return messageByStatus(e.status) || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
			}
			return e.msg
		}

		const status = e.status ?? e.response?.status
		const data = e.response?.data

		if (isHtmlResponse(data)) {
			return messageByStatus(status) || '서버 오류가 발생했습니다.'
		}

		if (data && typeof data === 'object') {
			const body = data as { msg?: string; message?: string; result?: string }
			if (body.msg) return body.msg
			if (body.message) return body.message
		}

		if (typeof data === 'string' && data.trim() && !isHtmlResponse(data)) {
			return data.length > 200 ? '서버 오류가 발생했습니다.' : data
		}

		const statusMessage = messageByStatus(status)
		if (statusMessage) return statusMessage

		if (typeof e.message === 'string' && e.message && !isHtmlResponse(e.message) && !isAxiosStatusMessage(e.message)) {
			return e.message
		}
	}

	return '요청 처리 중 오류가 발생했습니다.'
}
