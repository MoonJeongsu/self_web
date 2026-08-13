type NativeBridge = {
	getFcmToken?: () => string | null | undefined
	getAppVersion?: () => string | null | undefined
	grantPermission?: () => void
	checkPermission?: () => void
}

declare global {
	interface Window {
		AndroidBridge?: NativeBridge
	}
}

function getBridge(): NativeBridge | undefined {
	if (typeof window === 'undefined') return undefined
	return window.AndroidBridge
}

/** 네이티브 앱 versionName (예: 1.0.2). 브릿지 없으면 빈 문자열 */
export function getAppVersion(): string {
	const bridge = getBridge()
	if (!bridge?.getAppVersion) return ''
	try {
		return String(bridge.getAppVersion() ?? '').trim()
	} catch {
		return ''
	}
}
