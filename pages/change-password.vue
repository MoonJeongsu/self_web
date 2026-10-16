<template>
	<Container
		class="change-password"
		isBack
		title="비밀번호 변경"
		desc="비밀번호 초기화 이후 변경의 경우<br>기관 관리자에게 전달 받은 비밀번호를<br>입력하세요."
	>
		<div class="forms">
			<div class="inner">
				<FormInput
					title="기존비밀번호"
					v-model="forms.currentPassword"
					type="password"
					placeholder="영문, 숫자 조합 8~ 20자리"
					:validate="state.currentPasswordValidation"
				/>
				<FormInput
					title="신규비밀번호"
					v-model="forms.password"
					type="password"
					placeholder="영문, 숫자 조합 8~ 20자리"
					:validate="state.passwordValidation"
				/>
				<FormInput
					title="신규 비밀번호 확인"
					v-model="forms.passwordConfirm"
					type="password"
					placeholder="비밀번호 확인"
					:validate="state.passwordConfirmValidation"
				/>
			</div>
			<CommonButton
				text="확인"
				:disabled="isSubmitting"
				@click="onSubmit"
			/>
		</div>
	</Container>
</template>

<script setup lang="ts">
import { mainApi } from '~/composables/api/main'

const toast = useAppToast()
const isSubmitting = ref(false)

const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

const forms = ref({
	currentPassword: '',
	password: '',
	passwordConfirm: '',
})

const state = ref({
	currentPasswordValidation: {
		status: '',
		text: '기존 비밀번호를 입력해주세요.',
	},
	passwordValidation: {
		status: '',
		text: '8~20자리의 영문, 숫자 조합의 비밀번호를 입력해주세요.',
		successTxt: '사용 가능한 비밀번호입니다.',
	},
	passwordConfirmValidation: {
		status: '',
		text: '입력하신 비밀번호와 일치하지 않습니다.',
		successTxt: '입력하신 비밀번호와 일치합니다.',
	},
})

const passwordGuide = '8~20자리의 영문, 숫자 조합의 비밀번호를 입력해주세요.'
const passwordMismatchGuide = '입력하신 비밀번호와 일치하지 않습니다.'

watch(
	() => [forms.value.password, forms.value.passwordConfirm],
	() => {
		if (!forms.value.passwordConfirm) {
			state.value.passwordConfirmValidation.status = ''
			state.value.passwordConfirmValidation.text = passwordMismatchGuide
			return
		}
		if (!passwordReg.test(forms.value.password)) {
			return
		}
		state.value.passwordConfirmValidation.text = passwordMismatchGuide
		state.value.passwordConfirmValidation.status =
			forms.value.password === forms.value.passwordConfirm ? 'success' : 'error'
	}
)

async function onSubmit() {
	let valid = true

	if (forms.value.currentPassword) {
		state.value.currentPasswordValidation.status = ''
	} else {
		state.value.currentPasswordValidation.status = 'error'
		valid = false
	}

	if (passwordReg.test(forms.value.password)) {
		state.value.passwordValidation.status = 'success'
		state.value.passwordConfirmValidation.text = passwordMismatchGuide
		if (forms.value.passwordConfirm && forms.value.password === forms.value.passwordConfirm) {
			state.value.passwordConfirmValidation.status = 'success'
		} else {
			state.value.passwordConfirmValidation.status = 'error'
			valid = false
		}
	} else {
		state.value.passwordValidation.status = 'error'
		state.value.passwordConfirmValidation.status = 'error'
		state.value.passwordConfirmValidation.text = passwordGuide
		valid = false
	}

	if (!valid) return

	isSubmitting.value = true
	try {
		await mainApi.changePassword({
			currentPassword: forms.value.currentPassword,
			password: forms.value.password,
		})
		toast.add({ title: '비밀번호가 변경되었습니다.' })
		await navigateTo('/setting')
	}
	catch (error: any) {
		const message = error?.msg || '비밀번호를 변경하지 못했습니다.'
		if (message.includes('기존 비밀번호')) {
			state.value.currentPasswordValidation.status = 'error'
			state.value.currentPasswordValidation.text = message
		}
		toast.add({ title: message })
	}
	finally {
		isSubmitting.value = false
	}
}
</script>

<style lang="scss" scoped>
.change-password {
	:deep(> .page-content) {
		height: calc(100vh - 74px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
		.forms {
			min-height: calc(100vh - 180px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
			display: flex;
			flex-direction: column;
			padding-top: 20px;
			padding-bottom: env(safe-area-inset-bottom, 0px);
			.inner {
				flex: 1;
			}
			.common-button {
				margin-top: auto;
			}
		}
	}
}
</style>
