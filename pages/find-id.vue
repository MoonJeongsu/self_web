<template>
	<Container
		class="find-id"
		isBack
		title="아이디 찾기"
		desc="가입 시 입력한 이름과 생년월일을<br>입력해 주세요."
	>
		<div class="forms" v-if="!foundLoginId">
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
			</div>
			<CommonButton
				text="확인"
				:disabled="isSubmitting"
				@click="onSubmit"
			/>
		</div>
		<div class="result" v-else>
			<p class="result-label">회원님의 아이디</p>
			<p class="result-id">{{ foundLoginId }}</p>
			<CommonButton
				text="로그인"
				@click="goLogin"
			/>
		</div>
	</Container>
</template>

<script setup>
import { mainApi } from '~/composables/api/main'
import { useAppToast } from '~/composables/useAppToast'

const toast = useAppToast()
const foundLoginId = ref('')
const isSubmitting = ref(false)
const forms = ref({
	name: '',
	birthDate: '',
})
const state = ref({
	nameValidation: { text: '이름을 입력해 주세요.', status: '' },
	birthValidation: { text: '8자리 생년월일을 입력해 주세요.', status: '' },
})

async function onSubmit() {
	let valid = true
	if (forms.value.name.trim()) {
		state.value.nameValidation.status = ''
	} else {
		state.value.nameValidation.status = 'error'
		valid = false
	}

	if (forms.value.birthDate.length === 8) {
		state.value.birthValidation.status = ''
	} else {
		state.value.birthValidation.status = 'error'
		valid = false
	}

	if (!valid) return

	isSubmitting.value = true
	try {
		const data = await mainApi.findLoginId({
			name: forms.value.name.trim(),
			birthDate: forms.value.birthDate,
		})
		const loginId = data?.loginId
		if (!loginId) {
			toast.add({ title: '일치하는 계정이 없습니다.' })
			return
		}
		foundLoginId.value = String(loginId)
	} catch (error) {
		toast.add({ title: error?.msg || '일치하는 계정이 없습니다.' })
	} finally {
		isSubmitting.value = false
	}
}

function goLogin() {
	navigateTo({
		path: '/login',
		query: { loginId: foundLoginId.value },
	})
}
</script>

<style lang="scss" scoped>
.find-id {
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
		.result {
			padding-top: 48px;
			text-align: center;
			.result-label {
				font-size: var(--s14);
				font-weight: 400;
				color: var(--gray600);
				margin-bottom: 8px;
			}
			.result-id {
				font-size: var(--s20);
				font-weight: 500;
				color: var(--gray800);
				margin-bottom: 48px;
			}
		}
	}
}
</style>
