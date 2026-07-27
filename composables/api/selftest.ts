import { useApi } from "../useApi";
import type {TestInfoType} from '~/types'
import { pickSelfTestId, unwrapApiData } from '~/utils/apiResponse'
import { dataUrlToFile } from '~/utils/image'

export type SelfTestSubmitResult = {
	selfTestId?: string | number
	raw: unknown
}

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
		return unwrapApiData(data) ?? data;
	}
	//자가진단 수행
	export async function addSelfTest(payload: {memberId: string, body: TestInfoType}): Promise<SelfTestSubmitResult> {
		const { memberId, body } = payload;
		const { kitImage, ...requestBody } = body
		void kitImage
		const { data, error } = await useApi(`/v1/selftest/${memberId}`, {
			method: 'POST',
			data: requestBody
		})
		if (error) throw error;
		return {
			selfTestId: pickSelfTestId(data),
			raw: data,
		}
	}
	//진단키트 사진 등록 (multipart)
	export async function uploadKitImage(payload: {
		selfTestId: string | number
		kitImage: string
		result?: string
		kitNumber?: string
	}) {
		const formData = new FormData()
		formData.append('photos', dataUrlToFile(payload.kitImage))
		formData.append('result', payload.result || 'NEGATIVE')
		formData.append('kitNumber', payload.kitNumber || `WEB-${Date.now()}`)

		const { data, error } = await useApi(`/v1/selftest/${payload.selfTestId}/kit`, {
			method: 'POST',
			data: formData,
		})
		if (error) throw error;
		return unwrapApiData(data) ?? data;
	}
}
