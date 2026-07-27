const options = {
	//성별 리스트
	genders: [
		{ title: '남', key: 'M' },
		{ title: '여', key: 'F'}
	],
	//근무지 정보
	workplaces: [
		{ text: 'KETI', value: 'KETI' },
		{ text: '서밋', value: '서밋' },
		{ text: '디토닉', value: '디토닉' },
		{ text: '어빌리티', value: '어빌리티' },
		{ text: '엔투엠', value: '엔투엠' },
		{ text: '가톨릭대', value: '가톨릭대' },
		{ text: '세종대', value: '세종대' },
		{ text: '순천향대', value: '순천향대' },
		{ text: '한신대', value: '한신대' },
		{ text: '기타', value: '기타' },
	],
	//근무형태
	workTypes: [
		{ text: '사무직', value: '사무직' },
		{ text: '연구직', value: '연구직' },
		{ text: '서비스직', value: '서비스직' },
		{ text: '영업/마케팅직', value: '영업/마케팅직' },
		{ text: '생산/기술직', value: '생산/기술직' },
	],
	//백신 접종 여부
	inoculations: [
		{ title: '백신접종 완료', key: true },
		{ title: '접종 안함', key: false },
	],
}

export default options