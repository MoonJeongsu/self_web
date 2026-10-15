export type VaccinationItem = {
	name: string
	date: string
}

export function emptyVaccination(): VaccinationItem {
	return { name: '', date: '' }
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

export function validVaccinations(
	isVaccinated: boolean | undefined,
	items: VaccinationItem[] | undefined
): boolean {
	if (isVaccinated !== true) return true
	return (items ?? []).some(item => item.name.trim() && item.date.trim())
}

export function toVaccinationPayload(
	isVaccinated: boolean | undefined,
	items: VaccinationItem[] | undefined
) {
	if (isVaccinated !== true) {
		return {
			isVaccinated: false,
			vaccinations: [] as VaccinationItem[],
		}
	}
	return {
		isVaccinated: true,
		vaccinations: (items ?? [])
			.map(item => ({
				name: item.name.trim(),
				date: item.date.trim(),
			}))
			.filter(item => item.name && item.date),
	}
}

export function formatVaccinationLine(item: VaccinationItem) {
	const date = item.date.replace(/-/g, '.')
	return date ? `${item.name} (${date})` : item.name
}
