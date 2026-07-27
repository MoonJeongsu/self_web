import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { WeeklyAttendanceStatus, WeekDayCell } from '~/types/attendance'

dayjs.extend(isoWeek)

export const ATTENDANCE_STORAGE_KEY = 'self_attendance_mock'
export const DEFAULT_MOCK_MEMBER_ID = 'mock-owner'
export const DEFAULT_MOCK_MEMBER_NAME = '홍길동'

type AttendanceStore = Record<string, string[]>

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function readStore(): AttendanceStore {
	if (!import.meta.client) return {}
	try {
		const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
		return raw ? JSON.parse(raw) : {}
	} catch {
		return {}
	}
}

function writeStore(store: AttendanceStore) {
	if (!import.meta.client) return
	localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(store))
}

function uniqueSorted(dates: string[]) {
	return [...new Set(dates)].sort()
}

function getWeekRange(baseDate = dayjs()) {
	const start = baseDate.startOf('isoWeek')
	const end = baseDate.endOf('isoWeek')
	return { start, end }
}

function formatPeriodLabel(start: dayjs.Dayjs, end: dayjs.Dayjs) {
	const fmt = (d: dayjs.Dayjs) => `${d.format('M/D')} (${WEEKDAY_LABELS[d.isoWeekday() - 1]})`
	return `${fmt(start)} ~ ${fmt(end)}`
}

export function useAttendanceMock() {
	function getDiagnosisDates(memberId: string): string[] {
		const store = readStore()
		return uniqueSorted(store[memberId] ?? [])
	}

	function recordDiagnosis(memberId: string, date = dayjs().format('YYYY-MM-DD')) {
		const store = readStore()
		const dates = uniqueSorted([...(store[memberId] ?? []), date])
		store[memberId] = dates
		writeStore(store)
		return date
	}

	function hasDiagnosisOnDate(memberId: string, date: string) {
		return getDiagnosisDates(memberId).includes(date)
	}

	function getDatesInWeek(memberId: string, baseDate = dayjs()) {
		const { start, end } = getWeekRange(baseDate)
		return getDiagnosisDates(memberId).filter(date => {
			const d = dayjs(date)
			return !d.isBefore(start, 'day') && !d.isAfter(end, 'day')
		})
	}

	function getWeekDayCells(baseDate = dayjs()): WeekDayCell[] {
		const { start } = getWeekRange(baseDate)
		const today = dayjs().startOf('day')

		return Array.from({ length: 7 }, (_, i) => {
			const d = start.add(i, 'day')
			const date = d.format('YYYY-MM-DD')
			return {
				date,
				dayOfMonth: d.date(),
				weekdayLabel: WEEKDAY_LABELS[i],
				isToday: d.isSame(today, 'day'),
				isFuture: d.isAfter(today, 'day'),
				isChecked: false,
			}
		})
	}

	function getWeeklyStatus(
		memberId: string,
		memberName = DEFAULT_MOCK_MEMBER_NAME,
		baseDate = dayjs(),
	): WeeklyAttendanceStatus {
		const today = dayjs().startOf('day')
		const base = baseDate.startOf('day')
		const { start, end } = getWeekRange(base)
		const diagnosedDatesInWeek = getDatesInWeek(memberId, base)
		const weeklyDiagnosisCount = diagnosedDatesInWeek.length
		const weeklyMissionCompleted = weeklyDiagnosisCount > 0
		const todayDiagnosed = hasDiagnosisOnDate(memberId, today.format('YYYY-MM-DD'))
		const daysRemainingInWeek = Math.max(end.diff(today, 'day'), 0)

		return {
			memberId,
			memberName,
			baseDate: base.format('YYYY-MM-DD'),
			weekStartDate: start.format('YYYY-MM-DD'),
			weekEndDate: end.format('YYYY-MM-DD'),
			weekLabel: `${base.format('YYYY년 M월')} · 이번 주`,
			periodLabel: formatPeriodLabel(start, end),
			todayDiagnosed,
			weeklyMissionCompleted,
			weeklyDiagnosisCount,
			daysRemainingInWeek,
			status: weeklyMissionCompleted ? 'COMPLETE' : 'PENDING',
			statusLabel: weeklyMissionCompleted ? '출석 완료' : '진단 필요',
			diagnosedDatesInWeek,
		}
	}

	function enrichWeekDayCells(status: WeeklyAttendanceStatus, baseDate = dayjs()): WeekDayCell[] {
		const checkedSet = new Set(status.diagnosedDatesInWeek)
		return getWeekDayCells(baseDate).map(cell => ({
			...cell,
			isChecked: checkedSet.has(cell.date),
		}))
	}

	function clearMember(memberId: string) {
		const store = readStore()
		delete store[memberId]
		writeStore(store)
	}

	return {
		getDiagnosisDates,
		recordDiagnosis,
		hasDiagnosisOnDate,
		getDatesInWeek,
		getWeeklyStatus,
		getWeekDayCells,
		enrichWeekDayCells,
		clearMember,
	}
}
