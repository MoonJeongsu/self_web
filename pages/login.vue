<template>
	<Container
		class="login"
	>
		<div class="logo">
			<div class="txt">
				<h6>대 국민 건강체크는</h6>
				<img src="@/assets/img/ic_logo_txt.svg">
			</div>
			<img src="@/assets/img/ic_logo.svg">
		</div>
		<div class="forms">
			<FormInput
				title="아이디"
				v-model="forms.loginId"
			/>
			<FormInput
				title="비밀번호"
				type="password"
				v-model="forms.password"
				:validate="state.passwordValidation"
			/>
			
			<div class="btns">
				<button>아이디찾기</button>
				<button>비밀번호 찾기</button>
				<button @click="goSignUp">회원가입</button>
			</div>
			<CommonButton
				text="로그인"
				:disabled="!forms.loginId || !forms.password"
				@click="onSubmit"
			/>
		</div>
		<div class="loading" v-if="isLoading">
			<CommonLoading
				title="로그인 중입니다."
				desc="잠시만 기다려주세요."
			/>
		</div>
	</Container>
</template>

<script setup>
import { mainApi } from '~/composables/api/main';
const state = ref({
	passwordValidation: { 
		text: '아이디 또는 비밀번호가 일치하지 않습니다.', 
		status: ''
	}
})

const forms = ref({
	loginId: '',
	password: '',
	fcmToken : ''
})
//로그인 버튼 클릭 시 loading 버튼 1초 노출
const isLoading = ref(false);

async function onSubmit() {
	try {
		const fcmToken = (window.AndroidBridge && AndroidBridge.getFcmToken())
                ? AndroidBridge.getFcmToken() : '';
        forms.value.fcmToken = fcmToken
		const res = await mainApi.login(forms.value);

		if(res) {
			isLoading.value = true;
			setTimeout(() => {
				navigateTo('/')
			}, 1000)
		}
	} catch(e) {
		state.value.passwordValidation.status = 'error'
	}
}

//회원가입으로 이동
function goSignUp() {
	navigateTo('/signup')
}
</script>

<style lang="scss" scoped>
.login {
	:deep(.logo) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20px;
		margin-bottom: 85px;
		.txt {
			h6 {
				font-size: var(--s16);
				font-weight: 400;
				color: var(--gray800);
				margin-bottom: 4px;
			}
		}
	}
	:deep(.btns) {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		margin-top: 24px;
		button {
			position: relative;
			width: calc(100% / 3);
			height: 24px;
			text-align: center;
			font-size: var(--s14);
			font-weight: 500;
			color: var(--gray600);
			&:last-child {
				&::after {
					display: none;
				}
			}
			&::after {
				position: absolute;
				top: 0;
				right: 0;
				content: '';
				width: 1px;
				height: 24px;
				background-color: var(--gray100);
			}
		}
	}
	.common-button {
		margin-top: 32px;
	}
}
</style>