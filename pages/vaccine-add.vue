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
						:is-vaccinated="true"
						disable-unvaccinated
						v-model="forms.vaccinatedDate"
						:error="validation.status === 'error' ? validation.text : ''"
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
import { normalizeMember } from '~/utils/profile'
import { addedVaccinationText, existingVaccinationText } from '~/utils/vaccination'

const route = useRoute()
const toast = useAppToast()

const existingText = ref('')
const forms = ref({
	isVaccinated: true,
	vaccinatedDate: '',
})
const validation = ref({ status: '', text: '접종 정보를 입력해주세요.' })

onMounted(async () => {
	const memberId = String(route.query.memberId ?? '')
	if (!memberId) return
	try {
		const res = await memberApi.getMembers()
		const member = (res?.list ?? [])
			.map((el: unknown) => normalizeMember(el))
			.find((el: { id: string }) => String(el.id) === memberId)
		existingText.value = existingVaccinationText(member)
		forms.value.vaccinatedDate = existingText.value
	}
	catch (error: any) {
		toast.add({ title: error?.msg || '접종 정보를 불러오지 못했습니다.' })
	}
})

async function onSubmit() {
	const { added, error } = addedVaccinationText(
		existingText.value,
		forms.value.vaccinatedDate
	)
	if (error) {
		validation.value = { status: 'error', text: error }
		return
	}
	validation.value.status = ''

	const memberId = String(route.query.memberId ?? '')
	if (!memberId) {
		toast.add({ title: '접종 대상을 확인할 수 없습니다.' })
		return
	}

	try {
		await memberApi.addVaccination(memberId, { vaccinationMemo: added })
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
