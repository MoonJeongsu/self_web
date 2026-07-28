import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { selfTestApi } from '~/composables/api/selftest'
import type { AttendanceWeekItem, WeeklyAttendanceApiData, WeeklyAttendanceStatus } from '~/types/attendance'

dayjs.extend(isoWeek)

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function formatPeriodLabel(start: dayjs.Dayjs, end: dayjs.Dayjs) {
	const fmt = (d: dayjs.Dayjs) => `${d.format('M/D')} (${WEEKDAY_LABELS[d.isoWeekday() - 1]})`
	return `${fmt(start)} ~ ${fmt(end)}`
}

function findCurrentWeek(weeks: AttendanceWeekItem[]) {
	return weeks.find(week => week.current) ?? weeks[weeks.length - 1]
}

export function extractSelfTestDatesInRange(
	apiData: Record<string, unknown[]>,
	startDate: string,
	endDate: string,
): string[] {
	const start = dayjs(startDate)
	const end = dayjs(endDate)

	return Object.keys(apiData)
		.filter(dateKey => {
			const d = dayjs(dateKey)
			return d.isValid() && !d.isBefore(start, 'day') && !d.isAfter(end, 'day')
		})
		.sort()
}

export async function enrichAttendanceWithSelfTestDates(
	status: WeeklyAttendanceStatus,
	memberId: string,
): Promise<WeeklyAttendanceStatus> {
	try {
		const res = await selfTestApi.getSelfTest({
			memberId,
			startDate: status.weekStartDate,
			endDate: status.weekEndDate,
		})
		const historyData = (res as { data?: Record<string, unknown[]> })?.data ?? res
		if (!historyData || typeof historyData !== 'object') return status

		const diagnosedDatesInWeek = extractSelfTestDatesInRange(
			historyData as Record<string, unknown[]>,
			status.weekStartDate,
			status.weekEndDate,
		)
		const today = dayjs().format('YYYY-MM-DD')

		return {
			...status,
			diagnosedDatesInWeek,
			todayDiagnosed: diagnosedDatesInWeek.includes(today),
			weeklyDiagnosisCount: diagnosedDatesInWeek.length,
		}
	} catch {
		return status
	}
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
	const status = weeklyMissionCompleted ? 'COMPLETE' : 'PENDING'

	return {
		memberId: fallbackMemberId,
		memberName: fallbackMemberName,
		baseDate: today.format('YYYY-MM-DD'),
		weekStartDate: displayStart.format('YYYY-MM-DD'),
		weekEndDate: displayEnd.format('YYYY-MM-DD'),
		weekLabel: `${today.format('YYYY년 M월')} · 이번 주`,
		periodLabel: formatPeriodLabel(displayStart, displayEnd),
		todayDiagnosed: false,
		weeklyMissionCompleted,
		weeklyDiagnosisCount: 0,
		daysRemainingInWeek: Math.max(displayEnd.diff(today, 'day'), 0),
		status,
		statusLabel: weeklyMissionCompleted ? '출석 완료' : '진단 필요',
		diagnosedDatesInWeek: [],
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
