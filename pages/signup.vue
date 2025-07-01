<template>
	<Container 
		class="signup"
		isBack
		:title="active.title"
		:desc="active.desc"
	>
		<template #content-top>
			<CommonSteps
				:list="steps"
				:active="active.order"
			/>
		</template>
		<div class="content">
			<div class="forms" v-if="active.order === 1">
				<div class="inner">
					<FormInput
						title="아이디"
						v-model="forms.loginId"
						placeholder="영문, 숫자 조합 6~20자리"
						:validate="state.loginIdValidation"
					/>
					<FormInput
						title="비밀번호"
						v-model="forms.password"
						type="password"
						placeholder="영문, 숫자 조합 8~ 20자리"
						:validate="state.passwordValidation"
					/>
					<FormInput
						style="margin-top: 4px"
						v-model="forms.passwordConfirm"
						type="password"
						placeholder="비밀번호 확인"
						:validate="state.passwordConfirmValidation"
					/>
				</div>
				<CommonButton
					text="확인"
					@click="onValidStep1"
				/>
			</div>
			<div class="forms" v-else-if="active.order === 2">
				<div class="inner">
					<FormInput
						title="성명"
						v-model="forms.name"
						placeholder="예) 홍길동"
						:validate="state.nameValidation"
					/>
					<FormInput
						title="생년월일"
						v-model="forms.birthDate"
						placeholder="예) 20000101"
						:validate="state.birthValidation"
					/>
					<CommonList
						type="radio"
						title="성별"
						:list="options.genders"
						:active="forms.gender"
						@click="key => forms.gender = key"
						:validate="state.genderValidation"
					/>
					<FormInput
						title="거주지 검색"
						v-model="forms.address"
						btnText="검색"
						placeholder="거주지"
						:validate="state.addressValidation"
						@submit="isShowSearchAddr = true"
					/>
				</div>
				<CommonButton
					text="확인"
					@click="onValidateStep2"
				/>
			</div>
			<div class="forms" v-else-if="active.order === 3">
				<div class="inner">
					<FormInput
						title="성명"
						v-model="memberForms.name"
						placeholder="예) 홍길동"
					/>
					<FormInput
						title="생년월일"
						v-model="memberForms.birthDate"
						placeholder="예) 20000101"
					/>
					<CommonList
						style="margin-top: 14px;"
						type="radio"
						title="성별"
						:list="options.genders"
						:active="memberForms.gender"
						@click="key => memberForms.gender = key"
					/>
				</div>
				<CommonButton
					text="등록"
					@click="onRegistMember"
				/>
			</div>
		</div>
		<div class="complete" v-if="isComplete">
			<div class="txt">
				<h4 class="title">회원가입 완료</h4>
				<p>지금 바로 자가진단을 통해<br>내 건강 상태를 체크해보세요.</p>
			</div>
			<img src="@/assets/img/img_success.png">
			<CommonButton
				text="마침"
				@click="isShowAddMember = true"
			/>
		</div>
		<!--동거인 등록 여부 확인 모달-->
		<Modal
			title="동거인을 등록할까요?"
			desc="함께 거주하는 분을 등록하여<br>기기 하나로 각자 진단이 가능합니다."
			cancelBtnTxt="다음에 할게요"
			submitBtnTxt="등록하기"
			:show="isShowAddMember"
			@cancel="onComplete"
			@submit="goMemberRegister"
		/>
		<!--동거인 등록 완료 모달-->
		<Modal
			title="동거인이 등록되었습니다."
			desc="동거인은 마이페이지를 통해<br>최대 6명까지 등록이 가능합니다."
			:show="isShowCompleteMember"
			@submit="onComplete"
		/>
		<ModalSearchAddr
			:show="isShowSearchAddr"
			@close="isShowSearchAddr = false"
			@select="onSearchAddress"
		/>
	</Container>
</template>

<script setup lang="ts">
import type { UserInfoType } from '~/types'
import { mainApi } from '~/composables/api/main'
import options from '~/utils/options'
import { memberApi } from '~/composables/api/member'
const state = ref({
	loginIdValidation: { status: '', text: '6~20자리의 영문, 숫자 조합의 ID를 입력해주세요', successTxt: '사용 가능한 ID입니다.'},
	passwordValidation: { status: '', text: '8~20자리의 영문, 숫자 조합의 비밀번호를 입력해주세요.', successTxt: '사용 가능한 비밀번호입니다.' },
	passwordConfirmValidation: { status: '', text: '입력하신 비밀번호와 일치하지 않습니다.', successTxt: '입력하신 비밀번호와 일치합니다.' },
	nameValidation: { status: '', text: '성명을 입력해주세요.' },
	birthValidation: { status: '', text: '생년월일 8자리를 입력해주세요.'},
	genderValidation: { status: '', text: '성별을 선택해주세요' },
	addressValidation: { status: '', text: '우측 검색 버튼을 통해 거주지를 입력해주세요.'}
})
const steps = ref([
	{ order: 1, title: '회원가입', desc: '스마트 자가진단을 사용할<br>계정 정보를 입력합니다.'},
	{ order: 2, title: '회원 정보 등록', desc: '회원 정보는 APP 사용자 통계에만 사용되며<br>그 외 어떠한 용도로도 사용되지 않습니다.'},
	{ order: 3, title: '동거인 등록', desc: '함께 거주 중인 인원을 등록하여 기기 하나로<br>각자 진단이 가능합니다.'}
])
const active = ref({
	order: 1,
	title: '',
	desc: ''
})
const forms = ref<UserInfoType>({
	loginId: '',
	password: '',
	passwordConfirm: '',
	name: '',
	birthDate: '',
	gender: '',
	address: '',
})
const memberForms = ref({
	name: '',
	birthDate: '',
	gender: ''
})
//회원가입한 유저 정보. 동거인 등록 시에는 해당 정보로 로그인 후, 등록 가능
const signupInfo = ref({})
//toast
const toast = useToast()
//카카오 주소 검색 모달
const isShowSearchAddr = ref(false);
//동거인 등록 모달
const isShowAddMember = ref(false);
//동거인 등록 완료 모달
const isShowCompleteMember = ref(false);
//회원가입 완료
const isComplete = ref(false);

onMounted(() => {
	active.value = steps.value[0]
})
//카카오 주소 검색 api
function onSearchAddress(val: string) {
	forms.value.address = val;
	isShowSearchAddr.value = false;
}

//동거인 등록 이동 : 로그인 => 동거인 등록
async function goMemberRegister() {
	isShowAddMember.value = false;
	isComplete.value = false;
	//로그인
	const res = await mainApi.login({loginId: forms.value.loginId, password: forms.value.password})
	if(res) {
		active.value = steps.value[2]
	}
}

//동거인 등록 완료
async function onRegistMember() {
	isShowAddMember.value = false;
	isShowCompleteMember.value = false;
	const res = await memberApi.addMembers(memberForms.value);
	if(res) {
		isShowCompleteMember.value = true;
	}
}

//완료
function onComplete() {
	isShowAddMember.value = false;
	isShowCompleteMember.value = false;
	navigateTo("/login");
}

//STEP1: 유효성 검사 : 아이디, 비밀번호, 비밀번호 확인
async function onValidStep1() {
	let result = true;
	
	//아이디 유효성 검사
	const loginIdReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
	if(loginIdReg.test(forms.value.loginId)) {
		state.value.loginIdValidation.status = 'success'
		const data = await mainApi.idCheck(forms.value.loginId);
		
		if(data.msg) {
			state.value.loginIdValidation.status = 'error'
			state.value.loginIdValidation.text = "이미 가입된 ID 입니다."
			result = false;
		}
	} else {
		state.value.loginIdValidation.status = 'error'
		state.value.loginIdValidation.text = "6~20자리의 영문, 숫자 조합의 ID를 입력해주세요"
		result = false;
	}

	//비밀번호 유효성 검사
	const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
	if(passwordReg.test(forms.value.password)) {
		state.value.passwordValidation.status = 'success'
	} else {
		state.value.passwordValidation.status = 'error'
		result = false;
	}

	//비밀번호 확인 유효성 검사
	if(forms.value.passwordConfirm && forms.value.password === forms.value.passwordConfirm) {
		state.value.passwordConfirmValidation.status = 'success'
	} else {
		state.value.passwordConfirmValidation.status = 'error'
		result = false;
	}

	if(result) {
		active.value = steps.value[1]
	}
}

//STEP2: 회원정보 등록. 성명, 생년월일, 성별, 거주지 유효성 검사
async function onValidateStep2() {
	let result = true;

	//이름 유효성 검사
	if(forms.value.name) {
		state.value.nameValidation.status = ''
		result = true;
	} else {
		state.value.nameValidation.status = 'error'
		result = false;
	}

	//생년월일 유효성 검사
	if(forms.value.birthDate.length === 8) {
		state.value.birthValidation.status = ''
		result = true;
	} else {
		state.value.birthValidation.status = 'error'
		result = false;
	}

	//성별 유효성 검사
	if(forms.value.gender) {
		state.value.genderValidation.status = '';
		result = true;
	} else {
		state.value.genderValidation.status = 'error';
		result = false;
	}

	//거주지 유효성 검사
	if(forms.value.address) {
		state.value.addressValidation.status = '';
		result = true
	} else {
		state.value.addressValidation.status = 'error';
		result = false;
	}

	if(result) {
		try {
			const res = await mainApi.signup(forms.value)
			if(res) {
				isComplete.value = true;
				signupInfo.value = res;
			}
		} catch (error: any) {
			console.log(error)
			toast.add({
				title: error?.msg
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.signup {
	position: relative;
	:deep(> .page-content) {
		height: calc(100vh - 74px);
		.forms {
			min-height: calc(100vh - 207px);
			display: flex;
			flex-direction: column;
			padding-top: 20px;
			.inner {
				flex: 1;
			}
			.common-button {
				margin-top: auto;
			}
		}
	}
	.content {
		// width: calc(100% - 40px);
		// position: absolute;
		// bottom: 0;
		// left: 20px;
		// height: calc(100vh - 180px);
		// z-index: 1;
		// .btns, .common-button {
		// 	position: sticky;
		// 	bottom: 26px;
		// 	z-index: 10;
		// }
		.btns:has(.gray) {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			.common-button {
				width: 100%;
			}
		}
	}
	:deep(.forms) {
		:has(.field-title) {
			.validate {
				height: 18px;
			}
		}
	}
	:deep(.common-steps) {
		margin: 10px 0 0;
	}
	.complete {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 10;
		background-color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		.txt {
			text-align: center;
			margin-bottom: 76px;
		}
		h4.title {
			font-size: var(--s18);
			font-weight: 500;
			color: var(--gray800);
			margin-bottom: 2px;
		}
		p.desc {
			font-size: var(--s16);
			font-weight: 400;
			color: var(--gray700);
			margin-top: 6px;
			:deep(b) {
				font-weight: 500;
				display: inline-block;
			}
		}
		img {
			width: 160px;
		}
		.common-button {
			position: absolute;
			bottom: 26px;
			left: 20px;
			width: calc(100% - 40px);
		}
	}
}
</style>
