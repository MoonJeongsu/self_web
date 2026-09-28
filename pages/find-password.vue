<template>
	<Container
		class="find-password"
		isBack
		title="비밀번호 찾기"
		desc="가입 시 입력한 계정 정보와<br>새 비밀번호를 입력해 주세요."
	>
		<div class="forms">
			<div class="inner">
				<FormInput
					title="아이디"
					v-model="forms.loginId"
					placeholder="영문, 숫자 조합 6~20자리"
					:validate="state.loginIdValidation"
				/>
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
				<FormInput
					title="새 비밀번호"
					v-model="forms.password"
					type="password"
					placeholder="영문, 숫자 조합 8~ 20자리"
					:validate="state.passwordValidation"
				/>
				<FormInput
					style="margin-top: 4px"
					v-model="forms.passwordConfirm"
					type="password"
					placeholder="새 비밀번호 확인"
					:validate="state.passwordConfirmValidation"
				/>
			</div>
			<CommonButton
				text="저장"
				:disabled="isSubmitting"
				@click="onSubmit"
			/>
		</div>
	</Container>
</template>

<script setup>
import { mainApi } from '~/composables/api/main'
import { useAppToast } from '~/composables/useAppToast'

const toast = useAppToast()
const isSubmitting = ref(false)
const forms = ref({
	loginId: '',
	name: '',
	birthDate: '',
	password: '',
	passwordConfirm: '',
})
const state = ref({
	loginIdValidation: { text: '아이디를 입력해 주세요.', status: '' },
	nameValidation: { text: '이름을 입력해 주세요.', status: '' },
	birthValidation: { text: '숫자 8자리 생년월일을 입력해 주세요. 예) 20000101', status: '' },
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

const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/

function isValidCompactBirthDate(value) {
	if (!/^\d{8}$/.test(value)) return false
	const year = Number(value.slice(0, 4))
	const month = Number(value.slice(4, 6))
	const day = Number(value.slice(6, 8))
	const date = new Date(year, month - 1, day)
	return date.getFullYear() === year
		&& date.getMonth() === month - 1
		&& date.getDate() === day
}

watch(
	() => [forms.value.password, forms.value.passwordConfirm],
	() => {
		if (!forms.value.passwordConfirm) {
			state.value.passwordConfirmValidation.status = ''
			return
		}
		state.value.passwordConfirmValidation.status =
			forms.value.password === forms.value.passwordConfirm ? 'success' : 'error'
	}
)

async function onSubmit() {
	let valid = true

	if (forms.value.loginId.trim()) {
		state.value.loginIdValidation.status = ''
	} else {
		state.value.loginIdValidation.status = 'error'
		valid = false
	}

	if (forms.value.name.trim()) {
		state.value.nameValidation.status = ''
	} else {
		state.value.nameValidation.status = 'error'
		valid = false
	}

	if (isValidCompactBirthDate(forms.value.birthDate)) {
		state.value.birthValidation.status = ''
	} else {
		state.value.birthValidation.status = 'error'
		valid = false
	}

	if (passwordReg.test(forms.value.password)) {
		state.value.passwordValidation.status = 'success'
	} else {
		state.value.passwordValidation.status = 'error'
		valid = false
	}

	if (forms.value.passwordConfirm && forms.value.password === forms.value.passwordConfirm) {
		state.value.passwordConfirmValidation.status = 'success'
	} else {
		state.value.passwordConfirmValidation.status = 'error'
		valid = false
	}

	if (!valid) return

	isSubmitting.value = true
	try {
		await mainApi.resetPassword({
			loginId: forms.value.loginId.trim(),
			name: forms.value.name.trim(),
			birthDate: forms.value.birthDate,
			password: forms.value.password,
		})
		toast.add({ title: '비밀번호가 변경되었습니다.' })
		await navigateTo({
			path: '/login',
			query: { loginId: forms.value.loginId.trim() },
		})
	} catch (error) {
		toast.add({ title: error?.msg || '일치하는 계정이 없습니다.' })
	} finally {
		isSubmitting.value = false
	}
}
</script>

<style lang="scss" scoped>
.find-password {
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
