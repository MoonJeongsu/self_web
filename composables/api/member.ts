import { useApi } from "../useApi";
import type { MemberInfoType } from "~/types";
import { unwrapApiData } from "~/utils/apiResponse";

//동거인
export namespace memberApi {
	//동거인 조회
	export async function getMembers(date?: string) {
		const { data, error } = await useApi('/v1/user/member/list', {
			method: 'GET',
			params: date ? { date } : undefined,
		});
		if (error) throw error;
		const unwrapped = unwrapApiData<{ list: MemberInfoType[] }>(data)
		return unwrapped ?? data;
	}
	//동거인 등록
	export async function addMembers(body: MemberInfoType) {
		const { data, error } = await useApi('/v1/user/member/add', {
			method: 'POST',
			data: body
		});
		if (error) throw error;
		return data;
	}
	//동거인 삭제
	export async function deleteMember(id: string) {
		const { data, error } = await useApi(`/v1/user/member/${id}`);
		if (error) throw error;
		return data;
	}
}