<template>
	<Container
		class="vaccine-add"
		isBack
		title="접종 정보 추가"
		desc="회원 가입 이후 접종 정보가 추가되었을 경우 입력 부탁드립니다."
	>
		<div class="content">
			<div class="forms">
				<div class="inner">
					<FormVaccinations
						:is-vaccinated="forms.isVaccinated !== false"
						v-model="forms.vaccinatedDate"
						:error="validation.status === 'error' ? validation.text : ''"
						@update:is-vaccinated="onSelectVaccination"
					/>
				</div>
				<CommonButton
					text="확인"
					@click="onSubmit"
				/>
			</div>
		</div>
	</Container>
</template>

<script setup lang="ts">
import { memberApi } from '~/composables/api/member'
import { toVaccinationPayload, validVaccinations } from '~/utils/vaccination'

const route = useRoute()
const toast = useAppToast()

const forms = ref({
	isVaccinated: true,
	vaccinatedDate: '',
})
const validation = ref({ status: '', text: '접종 정보를 입력해주세요.' })

function onSelectVaccination(key: boolean) {
	forms.value.isVaccinated = key
	if (!key) {
		forms.value.vaccinatedDate = ''
		validation.value.status = ''
	}
}

async function onSubmit() {
	if (forms.value.isVaccinated !== true) {
		navigateTo('/setting')
		return
	}
	if (!validVaccinations(forms.value.isVaccinated, forms.value.vaccinatedDate)) {
		validation.value.status = 'error'
		return
	}
	validation.value.status = ''

	const memberId = String(route.query.memberId ?? '')
	if (!memberId) {
		toast.add({ title: '접종 대상을 확인할 수 없습니다.' })
		return
	}

	const vaccine = toVaccinationPayload(true, forms.value.vaccinatedDate)
	try {
		for (const item of vaccine.vaccinations) {
			await memberApi.addVaccination(memberId, item)
		}
		await navigateTo('/setting')
	}
	catch (error: any) {
		toast.add({ title: error?.msg || '접종 정보를 추가하지 못했습니다.' })
	}
}
</script>

<style lang="scss" scoped>
.vaccine-add {
	position: relative;
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
