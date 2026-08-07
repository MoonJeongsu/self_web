/**
 * 토스트 연타 시 중복 노출을 막기 위한 래퍼.
 * 새 토스트를 띄우기 전에 기존 토스트를 모두 제거하고 단일 id로 표시한다.
 */
export function useAppToast() {
	const toast = useToast()

	return {
		...toast,
		add(notification: Parameters<typeof toast.add>[0]) {
			toast.clear()
			return toast.add({
				...notification,
				id: 'app-toast',
			})
		},
	}
}
