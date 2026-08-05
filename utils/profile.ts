import type { ProfileUserType, MemberInfoType } from '~/types'
import dayjs from 'dayjs'

function pickField(obj: Record<string, unknown>, keys: string[]): unknown {
	for (const key of keys) {
		const val = obj[key]
		if (val != null && val !== '') return val
	}
	return undefined
}

export function formatBirthDate(value: unknown): string {
	if (value == null || value === '') return ''
	const str = String(value).trim()
	if (/^\d{8}$/.test(str)) return str
	const parsed = dayjs(str)
	return parsed.isValid() ? parsed.format('YYYYMMDD') : str
}

function pickName(obj: Record<string, unknown>): string {
	for (const key of ['name', 'userName', 'user_name', 'memberName', 'member_name']) {
		const val = obj[key]
		if (typeof val === 'string' && val.trim() && !/^\d{8}$/.test(val.trim())) {
			return val.trim()
		}
	}
	const fallback = pickField(obj, ['name', 'userName', 'user_name'])
	return fallback != null ? String(fallback).trim() : ''
}

export function normalizeProfileUser(raw: unknown): ProfileUserType {
	const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
	const birthRaw = pickField(obj, ['birth_date', 'birthDate', 'birthday'])

	return {
		id: pickField(obj, ['id', 'userId', 'user_id', 'memberId', 'member_id']) as string | number | undefined,
		login_id: String(pickField(obj, ['login_id', 'loginId']) ?? ''),
		name: pickName(obj),
		gender: String(pickField(obj, ['gender', 'sex']) ?? ''),
		birthDate: formatBirthDate(birthRaw),
		birth_date: birthRaw != null ? String(birthRaw) : undefined,
		address: String(pickField(obj, ['address']) ?? ''),
		address_detail: String(pickField(obj, ['address_detail', 'addressDetail']) ?? ''),
		workplace: String(pickField(obj, ['workplace', 'work_place']) ?? ''),
		workType: String(pickField(obj, ['workType', 'work_type']) ?? ''),
		alarm: String(pickField(obj, ['alarm']) ?? 'Y'),
	}
}

export function normalizeMember(raw: unknown): MemberInfoType {
	const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
	const birthRaw = pickField(obj, ['birthDate', 'birth_date', 'birthday'])

	return {
		id: String(pickField(obj, ['id', 'memberId', 'member_id']) ?? ''),
		name: String(pickField(obj, ['name', 'userName', 'user_name']) ?? '').trim(),
		birthDate: formatBirthDate(birthRaw),
		gender: String(pickField(obj, ['gender', 'sex']) ?? ''),
		isComplete: String(pickField(obj, ['isComplete', 'is_complete']) ?? ''),
		isVaccinated: obj.isVaccinated as boolean | undefined,
		vaccinatedDate: obj.vaccinatedDate as string | undefined,
	}
}

export function isPrimaryUserMember(member: MemberInfoType, profile: ProfileUserType): boolean {
	if (profile.id != null && profile.id !== '' && member.id) {
		if (String(member.id) === String(profile.id)) return true
	}

	const profileName = profile.name?.trim()
	const memberName = member.name?.trim()
	if (!profileName || !memberName || profileName !== memberName) return false

	const profileBirth = formatBirthDate(profile.birthDate ?? profile.birth_date)
	const memberBirth = formatBirthDate(member.birthDate)
	if (!profileBirth || !memberBirth) return true

	return profileBirth === memberBirth
}

export function mergeProfileWithOwner(profile: ProfileUserType, owner: MemberInfoType): ProfileUserType {
	const profileName = profile.name?.trim()
	const ownerName = owner.name?.trim()
	const shouldUseOwnerName = !profileName || /^\d{8}$/.test(profileName)

	return {
		...profile,
		id: profile.id ?? owner.id,
		name: shouldUseOwnerName && ownerName ? ownerName : profile.name,
		birthDate: profile.birthDate || formatBirthDate(owner.birthDate),
		gender: profile.gender || owner.gender,
	}
}
