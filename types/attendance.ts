export type AttendanceStatus = 'PENDING' | 'COMPLETE'

export type WeeklyAttendanceStatus = {
	memberId: string
	memberName: string
	baseDate: string
	weekStartDate: string
	weekEndDate: string
	weekLabel: string
	periodLabel: string
	todayDiagnosed: boolean
	weeklyMissionCompleted: boolean
	weeklyDiagnosisCount: number
	daysRemainingInWeek: number
	status: AttendanceStatus
	statusLabel: string
	diagnosedDatesInWeek: string[]
}

export type WeekDayCell = {
	date: string
	dayOfMonth: number
	weekdayLabel: string
	isToday: boolean
	isFuture: boolean
	isChecked: boolean
}

export type AttendanceWeekItem = {
	week: number
	startDate: string
	endDate: string
	achieved: boolean
	current: boolean
}

/** GET /v1/user/attendance/weekly 응답 data */
export type WeeklyAttendanceApiData = {
	startDate?: string
	endDate?: string
	currentWeekAchieved?: boolean
	achievedWeeks?: number
	weeks?: AttendanceWeekItem[]
	/** 문서/레거시 스펙 (백엔드가 내려주는 경우) */
	memberId?: string | number
	memberName?: string
	baseDate?: string
	weekStartDate?: string
	weekEndDate?: string
	weekLabel?: string
	periodLabel?: string
	todayDiagnosed?: boolean
	weeklyMissionCompleted?: boolean
	weeklyDiagnosisCount?: number
	daysRemainingInWeek?: number
	status?: AttendanceStatus
	statusLabel?: string
	diagnosedDatesInWeek?: string[]
}
