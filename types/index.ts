//로그인 폼
export type SignInType = {
	loginId: string;
	password: string;
}

//회원가입 요청
export type SignupRequestType = {
	loginId: string;
	password: string;
	name: string;
	birthDate: string;
	gender: string;
	workplace: string;
	workType: string;
	address?: string;
	addressDetail?: string;
}

//유저 정보 (폼·프로필)
export type UserInfoType = SignupRequestType & {
	passwordConfirm?: string;
	address?: string;
	addressDetail?: string;
	isVaccinated?: boolean;
	vaccinatedDate?: string;
}

//로그인·프로필 조회 응답
export type ProfileUserType = {
	id?: string | number;
	login_id?: string;
	name: string;
	gender: string;
	birthDate?: string;
	birth_date?: string;
	address?: string;
	address_detail?: string;
	workplace?: string;
	workType?: string;
	alarm?: string;
}

//동거인 정보
export type MemberInfoType = {
	id: string;
	name: string;
	birthDate: string;
	gender: string;
	isComplete: string;
	isVaccinated?: boolean;
	vaccinatedDate?: string;
}

//params
export type ParamsType = {
	startDate?: string;
	endDate?: string;
}

//자가진단 폼
export type TestInfoType = {
	currentCondition: string[];
	vaccineStatus: {
		temperature: number;
		isVaccinated: boolean;
		vaccinatedDate: string;
		vaccinationMemo?: string;
	};
	answer: {
        value: number;
    }[];
	kitImage?: string;
}