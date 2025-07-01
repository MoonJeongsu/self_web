// ~/composables/kakao.ts
const REST_API_KEY = '23bb6da426da87dec8546596ecb819cd'

// 1. 주소 → 좌표 변환
export async function getCoordsByAddress(address: string) {
	try {
		const res: any = await $fetch('https://dapi.kakao.com/v2/local/search/address.json', {
			headers: {
				Authorization: `KakaoAK ${REST_API_KEY}`,
				KA: 'sdk/1.0 os=web lang=ko-KR device=nuxt3'
			},
			params: { query: address }
		});
		const doc = res.documents?.[0];
		if (!doc) throw new Error('주소 검색 결과 없음');
		return {
			lat: parseFloat(doc.y),
			lng: parseFloat(doc.x)
		}
	} catch (e) {
		console.error('주소 → 좌표 변환 실패:', e);
		throw e;
	}
}

// 2. 좌표 → 주변 병원 검색
export async function searchNearbyHospitals(lat: number, lng: number) {
	try {
		const res: any = await $fetch('https://dapi.kakao.com/v2/local/search/category.json', {
			headers: {
				Authorization: `KakaoAK ${REST_API_KEY}`,
				KA: 'sdk/1.0 os=web lang=ko-KR device=nuxt3'
			},
			params: {
				category_group_code: 'HP8', // 병원
				x: lng,
				y: lat,
				radius: 2000,
				sort: 'distance',
				size: 5
			}
		});
		return res.documents.map((item: any) => ({
			name: item.place_name,
			phone: item.phone,
			address: item.road_address_name || item.address_name,
			coords: { lat: parseFloat(item.y), lng: parseFloat(item.x) },
			url: item.place_url
		}))
	} catch (e) {
		console.error('병원 검색 실패:', e);
		return [];
	}
}