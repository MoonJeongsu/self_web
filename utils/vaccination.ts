export type VaccinationItem = {
	name: string
	date: string
}

export function parseVaccinations(raw: unknown): VaccinationItem[] {
	let source: unknown = raw
	if (typeof raw === 'string') {
		const trimmed = raw.trim()
		if (!trimmed) return []
		try {
			source = JSON.parse(trimmed)
		}
		catch {
			return []
		}
	}
	if (!Array.isArray(source)) return []
	return source
		.map(item => {
			if (!item || typeof item !== 'object') return null
			const row = item as Record<string, unknown>
			const name = String(row.name ?? '').trim()
			const date = String(row.date ?? '').trim()
			if (!name) return null
			return { name, date }
		})
		.filter((item): item is VaccinationItem => item != null)
}

export function vaccinationLines(text: string | undefined): string[] {
	return (text ?? '')
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean)
}

export function validVaccinations(
	isVaccinated: boolean | undefined,
	text: string | undefined
): boolean {
	if (isVaccinated !== true) return true
	return vaccinationLines(text).length > 0
}

function todayIso(): string {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function toVaccinationPayload(
	isVaccinated: boolean | undefined,
	text: string | undefined
) {
	if (isVaccinated !== true) {
		return {
			isVaccinated: false,
			vaccinations: [] as VaccinationItem[],
			vaccinationMemo: '',
		}
	}
	const memo = (text ?? '').trim()
	const date = todayIso()
	return {
		isVaccinated: true,
		vaccinationMemo: memo,
		vaccinations: vaccinationLines(memo).map(line => ({
			name: line.slice(0, 100),
			date,
		})),
	}
}

export function formatVaccinationLine(item: VaccinationItem) {
	return String(item.name ?? '')
		.replace(/\(\d{4}[.\-]\d{1,2}(?:[.\-]\d{1,2})?\)/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function existingVaccinationText(member: {
	vaccinationMemo?: string
	vaccinationText?: string
	vaccinations?: VaccinationItem[]
} | null | undefined): string {
	if (!member) return ''
	const memo = String(member.vaccinationMemo ?? '').trim()
	if (memo) return memo
	const names = (member.vaccinations ?? [])
		.map(item => formatVaccinationLine(item))
		.filter(Boolean)
	if (names.length) return names.join('\n')
	const text = String(member.vaccinationText ?? '').trim()
	if (text && text !== '접종 안함') return text
	return ''
}

export function addedVaccinationText(existing: string, next: string): {
	added: string
	error: string
} {
	const oldText = (existing ?? '').replace(/\s+$/g, '')
	const newText = (next ?? '').replace(/\s+$/g, '')
	if (!newText.trim()) {
		return { added: '', error: '접종 정보를 입력해주세요.' }
	}
	if (newText === oldText) {
		return { added: '', error: '변경된 내용이 없습니다.' }
	}
	return { added: newText, error: '' }
}
