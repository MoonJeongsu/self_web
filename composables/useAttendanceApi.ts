import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { AttendanceWeekItem, WeeklyAttendanceApiData, WeeklyAttendanceStatus } from '~/types/attendance'

dayjs.extend(isoWeek)

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function formatPeriodLabel(start: dayjs.Dayjs, end: dayjs.Dayjs) {
	const fmt = (d: dayjs.Dayjs) => `${d.format('M/D')} (${WEEKDAY_LABELS[d.isoWeekday() - 1]})`
	return `${fmt(start)} ~ ${fmt(end)}`
}

function isDateInRange(date: dayjs.Dayjs, start: dayjs.Dayjs, end: dayjs.Dayjs) {
	return !date.isBefore(start, 'day') && !date.isAfter(end, 'day')
}

function findCurrentWeek(weeks: AttendanceWeekItem[]) {
	return weeks.find(week => week.current) ?? weeks[weeks.length - 1]
}

function inferDiagnosedDatesInWeek(
	currentWeek: AttendanceWeekItem | undefined,
	today: dayjs.Dayjs,
): string[] {
	if (!currentWeek?.achieved) return []

	const start = dayjs(currentWeek.startDate)
	const end = dayjs(currentWeek.endDate)

	if (start.isSame(end, 'day')) {
		return [currentWeek.startDate]
	}

	if (isDateInRange(today, start, end)) {
		return [today.format('YYYY-MM-DD')]
	}

	return [currentWeek.startDate]
}

function mapEventWeeklyAttendanceApi(
	apiData: WeeklyAttendanceApiData,
	fallbackMemberName: string,
	fallbackMemberId: string,
): WeeklyAttendanceStatus {
	const today = dayjs().startOf('day')
	const weeks = apiData.weeks ?? []
	const currentWeek = findCurrentWeek(weeks)
	// 표시용: ISO 달력 주(월~일). 미션 판정은 API 이벤트 주차(currentWeek) 유지.
	const displayStart = today.startOf('isoWeek')
	const displayEnd = today.endOf('isoWeek')
	const weeklyMissionCompleted = apiData.currentWeekAchieved ?? currentWeek?.achieved ?? false
	const diagnosedDatesInWeek = inferDiagnosedDatesInWeek(currentWeek, today)
	const todayStr = today.format('YYYY-MM-DD')
	const todayDiagnosed = diagnosedDatesInWeek.includes(todayStr)
	const status = weeklyMissionCompleted ? 'COMPLETE' : 'PENDING'

	return {
		memberId: fallbackMemberId,
		memberName: fallbackMemberName,
		baseDate: today.format('YYYY-MM-DD'),
		weekStartDate: displayStart.format('YYYY-MM-DD'),
		weekEndDate: displayEnd.format('YYYY-MM-DD'),
		weekLabel: `${today.format('YYYY년 M월')} · 이번 주`,
		periodLabel: formatPeriodLabel(displayStart, displayEnd),
		todayDiagnosed,
		weeklyMissionCompleted,
		weeklyDiagnosisCount: diagnosedDatesInWeek.length,
		daysRemainingInWeek: Math.max(displayEnd.diff(today, 'day'), 0),
		status,
		statusLabel: weeklyMissionCompleted ? '출석 완료' : '진단 필요',
		diagnosedDatesInWeek,
	}
}

function mapLegacyWeeklyAttendanceApi(
	apiData: WeeklyAttendanceApiData,
	fallbackMemberName: string,
	fallbackMemberId: string,
): WeeklyAttendanceStatus {
	const base = apiData.baseDate ? dayjs(apiData.baseDate) : dayjs()
	const start = apiData.weekStartDate
		? dayjs(apiData.weekStartDate)
		: base.startOf('isoWeek')
	const end = apiData.weekEndDate
		? dayjs(apiData.weekEndDate)
		: base.endOf('isoWeek')
	const today = dayjs().startOf('day')
	const diagnosedDatesInWeek = apiData.diagnosedDatesInWeek ?? []
	const weeklyMissionCompleted = apiData.weeklyMissionCompleted ?? false
	const status = apiData.status ?? (weeklyMissionCompleted ? 'COMPLETE' : 'PENDING')

	return {
		memberId: String(apiData.memberId ?? fallbackMemberId),
		memberName: apiData.memberName || fallbackMemberName,
		baseDate: base.format('YYYY-MM-DD'),
		weekStartDate: start.format('YYYY-MM-DD'),
		weekEndDate: end.format('YYYY-MM-DD'),
		weekLabel: apiData.weekLabel || `${base.format('YYYY년 M월')} · 이번 주`,
		periodLabel: apiData.periodLabel || formatPeriodLabel(start, end),
		todayDiagnosed: apiData.todayDiagnosed ?? false,
		weeklyMissionCompleted,
		weeklyDiagnosisCount: apiData.weeklyDiagnosisCount ?? diagnosedDatesInWeek.length,
		daysRemainingInWeek: apiData.daysRemainingInWeek ?? Math.max(end.diff(today, 'day'), 0),
		status,
		statusLabel: apiData.statusLabel || (weeklyMissionCompleted ? '출석 완료' : '진단 필요'),
		diagnosedDatesInWeek,
	}
}

export function mapWeeklyAttendanceApi(
	apiData: WeeklyAttendanceApiData,
	fallbackMemberName = '',
	fallbackMemberId = '',
): WeeklyAttendanceStatus {
	if (Array.isArray(apiData.weeks)) {
		return mapEventWeeklyAttendanceApi(apiData, fallbackMemberName, fallbackMemberId)
	}

	return mapLegacyWeeklyAttendanceApi(apiData, fallbackMemberName, fallbackMemberId)
}
