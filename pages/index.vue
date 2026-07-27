<template>

	<div class="main">

		<div class="banner"></div>

		<div class="card-stack">

			<AttendanceWeeklyCard

				v-if="attendanceStatus"

				:status="attendanceStatus"

				@check-in="goStart"

				@history="goHistory"

			/>

			<div class="intro" :class="{ 'done-today': attendanceStatus?.todayDiagnosed }">

				<b>자가 진단하기</b>

				<h2 v-if="attendanceStatus?.todayDiagnosed">오늘의 진단을<br>완료했습니다.</h2>

				<h2 v-else>오늘의 건강상태를 확인해주세요.</h2>

				<CommonButton

					:text="attendanceStatus?.todayDiagnosed ? '추가 진단하기' : '시작하기'"

					@click="goStart"

				/>

				<p>이미 당일 자가진단을 진행하신 경우<br>지금 진행한 자가진단 결과가 이력에 반영됩니다.</p>

			</div>

		</div>

		<div class="list">

			<CommonCard

				v-for="(item, index) in state.list"

				:key="`card${index}`"

				:title="item.title"

				:desc="item.desc"

				:img="item.img"

				:bgColor="item.bgColor"

			/>

		</div>

		<ModalDiagnosis

			v-show="isShowDiagnosis"

			:key="diagnosisSession"

			@cancel="onDiagnosisClose"

			@completed="onDiagnosisCompleted"

		/>

	</div>

</template>



<script setup lang="ts">

import { ATTENDANCE_MOCK } from '~/utils/featureFlags'

import {

	DEFAULT_MOCK_MEMBER_ID,

	DEFAULT_MOCK_MEMBER_NAME,

	useAttendanceMock,

} from '~/composables/useAttendanceMock'

import { mapWeeklyAttendanceApi } from '~/composables/useAttendanceApi'

import { attendanceApi } from '~/composables/api/attendance'

import type { WeeklyAttendanceStatus } from '~/types/attendance'

import { memberApi } from '~/composables/api/member'



definePageMeta({

	layout: 'page',

})



import cardImg1 from '@/assets/img/main_1.png'

import cardImg2 from '@/assets/img/main_2.png'

import cardImg3 from '@/assets/img/main_3.png'



const toast = useToast()

const { getWeeklyStatus } = useAttendanceMock()



const state = ref({

	list: [

		{ title: '개인정보가 보호됩니다.', desc: '진단 내용은 감염병 확인 여부 외<br>어떠한 용도로도 사용되지 않습니다.', img: cardImg1, bgColor: '#FEFDE6' },

		{ title: '질문에 대해 솔직하게<br>답변해주세요.', desc: '정확한 답변일수록 진단 정확도가 올라갑니다.', img: cardImg2, bgColor: '#FEF2F6' },

		{ title: '건강 이상 유무를 알려드려요.', desc: '자세한 사항은 병원에 내원하셔서<br>진단을 받아보시길 권장드립니다.', img: cardImg3, bgColor: '#EDF5FD' },

	],

})



const isShowDiagnosis = ref(false)

const diagnosisSession = ref(0)

const activeMemberId = ref(DEFAULT_MOCK_MEMBER_ID)

const activeMemberName = ref(DEFAULT_MOCK_MEMBER_NAME)

const attendanceStatus = ref<WeeklyAttendanceStatus | null>(null)



onMounted(() => {

	loadAttendanceContext()

})



function loadAttendanceContext() {

	resolveActiveMember().then(() => refreshAttendance())

}



async function resolveActiveMember() {

	try {

		const res = await memberApi.getMembers()

		const owner = res?.list?.[0]

		if (owner?.id) {

			activeMemberId.value = String(owner.id)

			activeMemberName.value = owner.name || DEFAULT_MOCK_MEMBER_NAME

		}

	} catch {

		activeMemberId.value = DEFAULT_MOCK_MEMBER_ID

		activeMemberName.value = DEFAULT_MOCK_MEMBER_NAME

	}

}



async function refreshAttendance() {

	if (ATTENDANCE_MOCK) {

		attendanceStatus.value = getWeeklyStatus(

			activeMemberId.value,

			activeMemberName.value,

		)

		return

	}



	try {

		const data = await attendanceApi.getWeekly({

			memberId: activeMemberId.value,

		})

		attendanceStatus.value = mapWeeklyAttendanceApi(
			data,
			activeMemberName.value,
			activeMemberId.value,
		)

		if (data.memberName) {
			activeMemberName.value = data.memberName
		}

	} catch (error) {

		console.warn('[attendance] weekly 조회 실패', error)

		attendanceStatus.value = null

	}

}



function goStart() {

	diagnosisSession.value += 1

	isShowDiagnosis.value = true

}



function goHistory() {

	navigateTo('/history')

}



function onDiagnosisClose() {

	isShowDiagnosis.value = false

	refreshAttendance()

}



async function onDiagnosisCompleted() {

	await refreshAttendance()

	toast.add({ title: '오늘 자가진단을 완료했어요' })

}

</script>



<style lang="scss" scoped>

.main {

	.banner {

		width: 100%;

		height: 188px;

		background-color: var(--active);

		background-image: url('~/assets/img/img_main_bg.svg');

		background-size: calc(100% - 13px);

		background-position: bottom 13px left 13px;

	}



	.card-stack {

		padding: 0 20px;

		margin-top: -46px;

		position: relative;

		z-index: 1;

		display: flex;

		flex-direction: column;

		gap: 12px;

	}



	.intro {

		width: 100%;

		border-radius: 6px;

		box-shadow: 1px 2px 8px rgba(81, 81, 81, 0.09);

		background-color: white;

		padding: 20px;



		&.done-today h2 {

			color: #777879;

			font-size: 16px;

		}



		.common-button {

			border-radius: 2px;

		}



		b {

			font-size: var(--s14);

			font-weight: 700;

			color: var(--active);

		}



		h2 {

			font-size: var(--s18);

			font-weight: 500;

			color: var(--gray800);

			margin: 8px 0 10px;

		}



		p {

			font-size: var(--s14);

			font-weight: 400;

			color: var(--gray400);

			margin-top: 14px;

		}

	}



	.list {

		padding: 0 20px;

		margin-top: 26px;

	}

}

</style>

