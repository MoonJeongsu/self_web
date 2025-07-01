import { useApi } from "../useApi";
import type { ParamsType } from '~/types'

//자가진단 알림
export namespace noticeApi {
	//알림목록 조회
	export async function getAlarm(params: ParamsType) {
		const { data, error } = await useApi(`/v1/user/alarm`, {
			method: 'GET',
			params: params
		});
		if (error) throw error;
		return data;
	}
	//알람 설정
	export async function changeAlarm(alarm: string) {
		const { data, error } = await useApi(`/v1/user/alarm`, {
			method: 'POST',
			data: {
				alarm: alarm
			}
		});
		if (error) throw error;
		return data;
	}
}