import { useApi } from '../useApi'
import { unwrapApiData } from '~/utils/apiResponse'
import type { WeeklyAttendanceApiData } from '~/types/attendance'

export namespace attendanceApi {
	export async function getWeekly(params?: { memberId?: string; baseDate?: string }) {
		const { data, error } = await useApi('/v1/user/attendance/weekly', {
			method: 'GET',
			params,
		})
		if (error) throw error
		return unwrapApiData<WeeklyAttendanceApiData>(data)
	}
}
