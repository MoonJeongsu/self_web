const PUBLIC_AUTH_PATHS = [
	'/v1/user/login',
	'/v1/user/signup',
	'/v1/user/id/check',
	'/v1/user/id/find',
	'/v1/user/password/reset',
	'/v1/admin/login',
]

function requestPath(url?: string): string {
	if (!url) return ''
	try {
		const parsed = new URL(url, 'http://local.invalid')
		return parsed.pathname
	} catch {
		return url.split('?')[0] || ''
	}
}

export function isPublicAuthRequest(method?: string, url?: string): boolean {
	if ((method || 'GET').toUpperCase() !== 'POST') return false
	const path = requestPath(url)
	return PUBLIC_AUTH_PATHS.some((publicPath) => path === publicPath || path.endsWith(publicPath))
}

export function isAuthPagePath(path?: string): boolean {
	const current = path || (import.meta.client ? window.location.pathname : '')
	return current.startsWith('/login') || current.startsWith('/signup') || current.startsWith('/find-id') || current.startsWith('/find-password')
}

export function clearAuthSession() {
	if (!import.meta.client) return
	localStorage.removeItem('accessToken')
	const accessToken = useCookie('accessToken')
	const userInfo = useCookie('userInfo')
	accessToken.value = null
	userInfo.value = null
}
