import { useApi } from "../useApi";
import type {TestInfoType} from '~/types'
//자가진단 이력
export namespace selfTestApi {
	//자가진단 이력 조회
	export async function getSelfTest(payload: {memberId: string, startDate: string, endDate: string}) {
		const {memberId, startDate, endDate} = payload
		const { data, error } = await useApi(`/v1/selftest/${memberId}/list`, {
			method: 'GET',
			params: {
				startDate: startDate,
				endDate: endDate
			}
		});
		if (error) throw error;
		return data;
	}
	//자가진단 수행
	export async function addSelfTest(payload: {memberId: string, body: TestInfoType}) {
		const { memberId, body } = payload;
		const { data, error } = await useApi(`/v1/selftest/${memberId}`, {
			method: 'POST',
			data: body
		})
		if (error) throw error;
		return data;
	}
}