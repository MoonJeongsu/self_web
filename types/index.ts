//로그인 폼
export type SignInType = {
	loginId: string;
	password: string;
}

//유저 정보, 회원가입
export type UserInfoType = {
	loginId: string;
	password: string;
	passwordConfirm?: string;
	name: string;
	birthDate: string;
	gender: string;
	address: string;
	addressDetail?: string;
}

//동거인 정보
export type MemberInfoType = {
	id: string;
	name: string;
	birthDate: string;
	gender: string;
	isComplete: string;
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
	};
	answer: {
        value: number;
    }[];
}