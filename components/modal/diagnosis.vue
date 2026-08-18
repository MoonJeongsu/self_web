<template>
	<Container 
		:class="['diagnosis', { 'step5-fit': active.order === 5 && !isComplete, 'is-complete': isComplete }]"
		isBack
		:title="active.title"
		:desc="active.desc"
		type="popup"
		@cancel="onCancel"
	>
		<template #content-top>
			<CommonSteps
				:list="state.steps"
				:active="active.order"
			/>
		</template>
		<div class="content">
			<div class="forms step1" v-if="active.order === 1">
				<CommonCard
					v-for="(item, index) in members"
					:key="`member${index}`"
					:title="item.name"
					:desc="item.isComplete == 'Y' ? '진단 완료' : ''"
					size="sm"
					@click="startDiagnosis(item)"
				/>
				<!-- <button class="btn-add"></button> -->
			</div>
			<div class="forms step2" v-else-if="active.order === 2">
				<CommonList
					type="select"
					:list="state.symptom"
					:selected="forms.currentCondition"
					@click="selectSymptom"
				/>
				<div class="btns">
					<CommonButton
						text="증상 없음"
						color="gray"
						size="xl"
						@click="onStep2(4)"
					/>
					<CommonButton
						text="다음"
						size="sm"
						@click="onStep2(2)"
					/>
				</div>
			</div>
			<div class="forms step3" v-else-if="active.order === 3">
				<div class="inner">
					<FormInput
						title="현재 체온 입력"
						:placeholder="`예) 36.5`"
						unit="℃"
						v-model="forms.vaccineStatus.temperature"
						:validate="state.validateTemperature"
					/>
					<CommonList
						type="radio"
						:list="state.inoculations"
						:active="forms.vaccineStatus.isVaccinated"
						@click="onSelectVaccination"
					/>
					<div v-if="forms.vaccineStatus.isVaccinated === true" class="field-textarea">
						<label class="field-title">백신접종 정보 입력</label>
						<textarea
							v-model="forms.vaccineStatus.vaccinatedDate"
							placeholder="예시) 인플루엔자 백신 3가, 4가 2025.11.1 접종&#10;예시)RSV 백신 2026.08.01 접종"
						/>
						<div class="validate">
							<p :class="state.validateLastInoculation.status">
								{{ state.validateLastInoculation.text }}
							</p>
						</div>
					</div>
				</div>
				<div class="btns">
					<CommonButton
						text="다음"
						@click="onValidateForm"
					/>
				</div>
			</div>
			<div class="forms step4" v-else-if="active.order === 4">
				<div class="detail-box"
					v-for="(detail, index) in state.detailSteps"
					:key="`detail${index}`"
					v-show="detail.order === detailStep.order"
				>
					<div 
						class="box"
					>
						<b>{{ detail.order }}. <span v-html="detail.title"></span></b>
						<FormRadio
							:list="detail.options"
							:key="`detail${detail.order}`"
							v-model="forms.answer[index].value"
						/>
					</div>
					<div class="btns">
						<CommonButton
							text="이전"
							color="gray"
							@click="beforeDetailStep(detailStep.order)"
						/>
						<CommonButton
							text="다음"
							@click="nextDetailStep(detailStep.order)"
						/>
					</div>
				</div>
			</div>
			<div class="forms step5" v-else-if="active.order === 5">
				<div class="inner">
					<FormKitUpload v-model="kitImage" fill />
				</div>
				<div class="btns">
					<CommonButton
						text="이전"
						color="gray"
						@click="beforeKitStep"
					/>
					<CommonButton
						text="등록 완료"
						@click="onKitUploadNext"
					/>
				</div>
			</div>
		</div>
		<div class="result" v-if="isComplete">
			<div class="title">
				<h4>자가진단을 완료했습니다.</h4>
				<p>이전 또는 당일 자가진단 이력은<br><b>진단이력 메뉴</b>에서 재차 확인이 가능합니다.</p>
			</div>
			<div class="box">
				<b>자가진단 결과</b>
				<p v-html="state.diagnosisResult"></p>
			</div>
			<!-- 인근 의료기관 (20260730: UI 확인 — 주석처리)
			<div class="box">
				<b>인근 의료기관</b>
				<p>진단 위치 : {{ user.address }}</p>
				<ul>
					<li
						v-for="(item, index) in state.facility"
						:key="`facility${index}`"
					>
						<p>{{ item.title }}</p>
						<span>{{ item.desc }}</span>
					</li>
				</ul>
			</div>
			-->
			<div class="btns">
				<CommonButton
					text="마침"
					@click="goHistory"
				/>
			</div>
		</div>
		<!--진단을 완료한 동거인을 선택한 경우-->
		<Modal
			:show="isShowComplete"
			title="오늘은 이미 진행하셨어요!"
			desc="다시 진단을 시작하면<br>해당 진단 결과로 저장됩니다."
			cancelBtnTxt="다음에 할게요"
			submitBtnTxt="시작하기"
			@cancel="isShowComplete = false"
			@submit="restartDiagnosis"
		/>
		<!--상세 단계 중 답변을 선택하지 않았을 때-->
		<Modal
			:show="isShowNotAnswer"
			title="답변하지 않은 질문이 있습니다."
			desc="답변하지 않을 경우<br>다음 문항 진행이 불가능합니다."
			submitBtnTxt="확인"
			@submit="isShowNotAnswer = false"
		/>
		<!--loading-->
		<CommonLoading
			v-if="isLoading"
			title="처리 중 입니다."
			desc="잠시만 기다려주세요."
		/>
	</Container>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { selfTestApi } from '~/composables/api/selftest'
import { memberApi } from '~/composables/api/member'
import { mainApi } from '~/composables/api/main'
import type {MemberInfoType, TestInfoType} from '~/types'
// import { getCoordsByAddress } from '@/composables/kakao'
import { formatApiError } from '@/utils/apiError'
import { ATTENDANCE_MOCK, DIAGNOSIS_MOCK, KIT_UPLOAD_MOCK } from '~/utils/featureFlags'
import {
	DEFAULT_MOCK_MEMBER_ID,
	DEFAULT_MOCK_MEMBER_NAME,
	useAttendanceMock,
} from '~/composables/useAttendanceMock'
import { useKitUploadMock } from '~/composables/useKitUploadMock'

interface StepType {
	order: number;
	title?: string;
	desc?: string
}

const toast = useAppToast()

/** 백엔드 /kit API 연동 */
const SKIP_KIT_UPLOAD = false

const { recordDiagnosis, hasDiagnosisOnDate } = useAttendanceMock()
const { saveKitUpload } = useKitUploadMock()

const emits = defineEmits<{
	cancel: []
	completed: [{ memberId: string; date: string }]
}>()
//거주 구성원
const members = ref<MemberInfoType[]>([])
//유저 프로필 - 주소를 알기 위해서 지정
const user = ref({
	id: '',
	login_id: '',
	name: '',
	gender: '',
	birthDate: '',
	address: '',
	address_detail: '',
	alarm: 'Y'
})
const state = ref({
	steps: [
		{ order: 1, title: '누가 진단하시나요?', desc: '아래 정보로 더 정확도 높은<br>진단 결과를 얻을 수 있어요.'},
		{ order: 2, title: '현재 증상을 알려주세요.', desc: '현재 겪고 있는 증상을 선택해 주세요.<br>증상이 모두 있을 경우 모두 선택해 주세요.'},
		{ order: 3, title: '접종 정보를 알려주세요.', desc: '현재 체온과 예방 접종 여부를 입력해 주세요.'},
		{ order: 4, title: '현재 상태를 진단합니다.', desc: ''},
		{ order: 5, title: '진단키트 결과를 촬영해 주세요.', desc: '사전 배포된 진단키트의 결과를<br>촬영하고 업로드해 주세요.<br>진단키트 사진이 없으면 “등록완료”<br>버튼을 눌러 진단을 완료해주세요.'}
	],
	detailSteps: [
		{ 
			order: 1, 
			title: '언제부터 증상이 시작됐나요? (가장 처음)', 
			options: [
				{ text: '오늘', value: 0 },
				{ text: '어제', value: 1 },
				{ text: '3일전', value: 2 },
				{ text: '4일전', value: 3 },
				{ text: '5일전', value: 4 },
				{ text: '6일전', value: 5 },
			]
		},
		{
			order: 2,
			title: '급성 호흡기 증상이 있나요? (호흡곤간, 기침 등)',
			options: [
				{ text: '예', value: 0 },
				{ text: '아니오', value: 1 }
			]
		},
		{
			order: 3,
			title: '14일 이내에 유증상자와 접촉한 이력이 있나요?',
			options: [
				{ text: '예', value: 0 },
				{ text: '아니오', value: 1 },
				{ text: '모름', value: 2 }
			]
		},
		{
			order: 4,
			title: '동거인 중 같은 증상이 있는 분이 있나요?<br>(최근, 현재 모두 포함)',
			options: [
				{ text: '예', value: 0 },
				{ text: '아니오', value: 1 }
			]
		},
		{
			order: 5,
			title: '해당 인원은 완치된 상태인가요?',
			options: [
				{ text: '예', value: 0 },
				{ text: '아니오', value: 1 }
			]
		},
	],
	//증상 리스트
	symptom: [
		{ title: '발열', key: 'CONDITION_FEVER' },
		{ title: '기침', key: 'CONDITION_COUGH' },
		{ title: '인후통', key: 'CONDITION_THROAT' },
	],
	//백신 여부
	inoculations: [
		{ title: '백신접종 완료', key: true },
		{ title: '접종 안함', key: false }
	],
	validateTemperature: {status: '', text: '30~45사이의 숫자만 입력해주세요.'},
	validateLastInoculation: {status: '', text: '접종 정보를 입력해주세요.'},
	//증상 시작 일자
	dates: [
		{ text: '오늘', value: '0' },
		{ text: '어제', value: '1' },
		{ text: '3일전', value: '2' },
		{ text: '4일전', value: '3' },
		{ text: '5일전', value: '4' },
		{ text: '6일전', value: '5' },
	],
	diagnosisResult: '자가진단 결과 현재 <span class="red">호흡기 질환</span>이 의심됩니다.<br>가족 또는 지인과의 접촉을 삼가시고 빠른 시일내에 가까운 병원에 방문하시길 권고드립니다.',
	//의료기관 리스트
	facility: []
})
const active = ref({
	order: 4,
	title: '',
	desc: ''
})
const detailStep = ref({
	order: 1,
	title: '',
	desc: '',
	options: []
})
//입력창
const forms = ref<TestInfoType>({
	currentCondition: [], //현재 증상,
	vaccineStatus: {
		temperature: "",
		isVaccinated: true,
		vaccinatedDate: ""
	},
	answer: state.value.detailSteps.map(() => ({ value: null }))
})
//선택한 멤버
const selected = ref({id: '', name: '', birthDate: '', gender: '', isComplete: ''})

//진단 완료한 동거인 선택시 안내 모달 
const isShowComplete = ref(false);
//STEP 완료
const isComplete = ref(false);
//loading
const isLoading = ref(false);
const isShowNotAnswer = ref(false);
const kitImage = ref('')

onMounted(async () => {
	active.value = state.value.steps[0]
	detailStep.value = state.value.detailSteps[0]

	if (DIAGNOSIS_MOCK) {
		user.value.name = DEFAULT_MOCK_MEMBER_NAME
		user.value.address = '서울특별시 강남구'
		await getMembers()
		return
	}

	await getProfile()
	await getMembers()
	// 인근 의료기관 조회 (20260730: UI 확인 — 주석처리)
	// setTimeout(async () => {
	// 	const { lat, lng } = await getCoordsByAddress(user.value.address)
	// 	const res = await searchNearbyHospitals(lat, lng)
	// 	if (Array.isArray(res) && res.length > 0) {
	// 		state.value.facility = res.slice(0, 3).map(el => {
	// 			el.title = el.name;
	// 			el.desc = el.phone;
	// 			return el;
	// 		});
	// 	} else {
	// 		state.value.facility = [];
	// 	}
	// }, 1000);
})

//프로필 조회
async function getProfile() {
	const profile = await mainApi.getProfile()

	if (profile) {
		user.value = { ...user.value, ...profile } as typeof user.value
		if (profile.address) {
			user.value.address = profile.address
		}
	}
}

//진단날짜 동적 세팅
function resolveDateValue(label: string): string {
	const today = dayjs()
	switch (label) {
		case '오늘':
			return today.format('YYYY-MM-DD')
		case '어제':
			return today.subtract(1, 'day').format('YYYY-MM-DD')
		case '3일전':
			return today.subtract(3, 'day').format('YYYY-MM-DD')
		case '4일전':
			return today.subtract(4, 'day').format('YYYY-MM-DD')
		case '5일전':
			return today.subtract(5, 'day').format('YYYY-MM-DD')
		case '6일전':
			return today.subtract(6, 'day').format('YYYY-MM-DD')
		default:
			return label
	}
}

//동거인 조회
async function getMembers() {
	const today = dayjs().format('YYYY-MM-DD')

	if (DIAGNOSIS_MOCK) {
		members.value = [{
			id: DEFAULT_MOCK_MEMBER_ID,
			name: DEFAULT_MOCK_MEMBER_NAME,
			gender: 'M',
			birthDate: '19900101',
			isComplete: hasDiagnosisOnDate(DEFAULT_MOCK_MEMBER_ID, today) ? 'Y' : 'N',
		}]
		return
	}

	const res = await memberApi.getMembers(today)
	if (res) members.value = res.list
}

function afterDiagnosisSaved() {
	const memberId = String(selected.value.id)
	const date = dayjs().format('YYYY-MM-DD')

	if (ATTENDANCE_MOCK && memberId) {
		recordDiagnosis(memberId, date)
	}

	members.value = members.value.map(m =>
		String(m.id) === memberId ? { ...m, isComplete: 'Y' as const } : m,
	)

	emits('completed', { memberId, date })
}

//STEP1: 진단 대상 선택 시 Step 4 제목 갱신
function updateDiagnosisTitle() {
	state.value.steps[3].title = `${selected.value.name} 님의 현재 상태를 진단합니다.`
}

//STEP1: 진단 완료한 동거인의 재진단
function startDiagnosis(item: MemberInfoType) {
	selected.value = item;
	kitImage.value = ''
	updateDiagnosisTitle()
	if(item.isComplete === 'Y') {
		isShowComplete.value = true;
		return;
	}
	active.value = state.value.steps[1]
}
function restartDiagnosis() {
	updateDiagnosisTitle()
	active.value = state.value.steps[1]
	isShowComplete.value = false;
}

//STEP2: 증상 선택 
function selectSymptom(key: string) {
	const symptoms = forms.value.currentCondition;
    const index = symptoms.indexOf(key);
    if (index === -1) {
        // key가 없으면 추가
        symptoms.push(key);
    } else {
        // 이미 있으면 제거
        symptoms.splice(index, 1);
    }
}

/** 신규 백엔드 6문항 — legacy 7문항 변환 비활성 */
const USE_LEGACY_ANSWER_FORMAT = false

function getApiErrorMessage(error: unknown): string {
	return formatApiError(error)
}

function mapAnswersForLegacyBackend(answers: { value: number | null }[]) {
	return [
		{ value: answers[0]?.value ?? 0 },
		{ value: answers[1]?.value ?? 0 },
		{ value: 1 },
		{ value: answers[2]?.value ?? 0 },
		{ value: 1 },
		{ value: answers[3]?.value ?? 0 },
		{ value: answers[4]?.value ?? 0 },
	]
}

function prepareSelfTestBody(form: TestInfoType): TestInfoType {
	const body: TestInfoType = {
		...form,
		vaccineStatus: { ...form.vaccineStatus },
		answer: form.answer.map(item => ({ value: Number(item.value ?? 0) })),
	}

	body.vaccineStatus.temperature = Number(body.vaccineStatus.temperature)

	if (!body.vaccineStatus.isVaccinated) {
		body.vaccineStatus.vaccinatedDate = ''
		body.vaccineStatus.vaccinationMemo = ''
	} else {
		const memo = form.vaccineStatus.vaccinatedDate?.trim() || ''
		body.vaccineStatus.vaccinationMemo = memo
		body.vaccineStatus.vaccinatedDate = /^\d{8}$/.test(memo)
			? formatCompactDate(memo)
			: ''
	}

	if (USE_LEGACY_ANSWER_FORMAT && body.answer.length === 5) {
		body.answer = mapAnswersForLegacyBackend(body.answer)
	} else if (body.answer.length === 5) {
		// UI 5문항 → 백엔드 6문항 호환 (6번째 기본값)
		body.answer.push({ value: 0 })
	}

	delete body.kitImage

	return body
}

// 숫자형 문자열을 'YYYY-MM-DD'로 포맷 변환
function formatCompactDate(dateStr: string): string {
	if (!/^\d{8}$/.test(dateStr)) return dateStr // 유효하지 않은 형식은 그대로 반환
	const parsed = dayjs(dateStr, 'YYYYMMDD')
	if (!parsed.isValid()) return dateStr
	return parsed.format('YYYY-MM-DD')
}

//STEP2: 증상 선택 후 다음 단계로 이동
function onStep2(step: number) {
	if(forms.value.currentCondition.length === 0 && step !== 4) {
		toast.add({
			title: '증상을 선택해주세요'
		})
		return;
	}
	if(step === 2) {
		state.value.diagnosisResult = `자가진단 결과 현재 <span class="red">건강이상</span>이 의심됩니다.<br><p>가족 또는 지인과의 접촉을 삼가시고 빠른 시일내에 가까운 병원에 방문하시길 권고드립니다.</p>`
		active.value = state.value.steps[2]
	} else {
		onComplete({
			"currentCondition": [],
			"vaccineStatus": {
				"temperature": 36.5,
				"isVaccinated": true,
				"vaccinatedDate": dayjs().format('YYYY-MM-DD')
			},
			"answer": [
				{ "value": 0 },
				{ "value": 0 },
				{ "value": 0 },
				{ "value": 0 },
				{ "value": 0 },
			]
		})
		state.value.diagnosisResult = `자가진단 결과 현재 <span class="green">정상</span>입니다.<br>외출 시 항상 마스크 착용을 권고드리며 건강 관리에 유의해주세요.`
		isComplete.value = true;
	}
}

//STEP3: 접종 정보 유효성 검사 
function onSelectVaccination(key: boolean) {
	forms.value.vaccineStatus.isVaccinated = key
	if (!key) {
		forms.value.vaccineStatus.vaccinatedDate = ''
		state.value.validateLastInoculation.status = ''
	}
}

function onValidateForm() {
	let result = true;

	if (forms.value.vaccineStatus.isVaccinated === true) {
		if (forms.value.vaccineStatus.vaccinatedDate?.trim()) {
			state.value.validateLastInoculation.status = ''
		} else {
			state.value.validateLastInoculation.status = 'error'
			result = false;
		}
	} else {
		state.value.validateLastInoculation.status = ''
	}

	//현재 체온
	if(!forms.value.vaccineStatus.temperature || (Number(forms.value.vaccineStatus.temperature) > 45 || Number(forms.value.vaccineStatus.temperature) < 30)) {	
		//30~45 사이 입력
		state.value.validateTemperature.status = 'error'
		result = false;
	} else {
		state.value.validateTemperature.status = ''
	}
	
	if(result) {
		active.value = state.value.steps[3]
	}
}

function goToKitStep() {
	active.value = state.value.steps[4]
}

function beforeKitStep() {
	active.value = state.value.steps[3]
	const lastOrder = state.value.detailSteps[state.value.detailSteps.length - 1].order
	detailStep.value = state.value.detailSteps.find(el => el.order === lastOrder)
		|| state.value.detailSteps[state.value.detailSteps.length - 1]
}

async function onKitUploadNext() {
	await onComplete()
}

//STEP5: 자가진단 + 진단키트 저장
async function onComplete(newForm?: TestInfoType) {
	isLoading.value = true;
	if(newForm) {
		forms.value = newForm
	}

	if (!selected.value.id) {
		isLoading.value = false
		toast.add({ title: '진단 대상을 선택해주세요.' })
		return
	}

	const body = prepareSelfTestBody(forms.value)

	const payload = {
		memberId: selected.value.id,
		body
	}

	if (DIAGNOSIS_MOCK) {
		console.log('[DIAGNOSIS_MOCK] 자가진단+진단키트:', payload)
		if (KIT_UPLOAD_MOCK && kitImage.value) {
			await saveKitUpload({
				memberId: String(selected.value.id),
				memberName: selected.value.name,
				kitImage: kitImage.value,
				testDate: dayjs().format('YYYY-MM-DD'),
				symptoms: forms.value.currentCondition?.join(', ') || undefined,
			})
		}
		afterDiagnosisSaved()
		setTimeout(() => {
			isLoading.value = false
			isComplete.value = true
		}, 500)
		return
	}

	try {
		const res = await selfTestApi.addSelfTest(payload)
		if (!SKIP_KIT_UPLOAD && kitImage.value && res.selfTestId) {
			await selfTestApi.uploadKitImage({
				selfTestId: res.selfTestId,
				kitImage: kitImage.value,
			})
		} else if (!SKIP_KIT_UPLOAD && kitImage.value && !res.selfTestId) {
			console.warn('[kit] selfTestId 없음 — kit 업로드 생략')
		}
		afterDiagnosisSaved()
		setTimeout(() => {
			isLoading.value = false
			isComplete.value = true
		}, 1000)
	} catch (error) {
		console.log(error)
		isLoading.value = false
		toast.add({ title: getApiErrorMessage(error) })
	}
}

//STEP5: 완료 후 이력페이지로 이동
async function goHistory() {
	await navigateTo('/history')
	await onCancel()
}

function onCancel() {
	if(active.value.order > 1) {
		active.value = state.value.steps[active.value.order - 2];
	} else {
		emits('cancel')
	}
}

//4단계 내 증상 입력 단계 이동
function beforeDetailStep(order: number) {
	if(order === 1) {
		toast.add({title: '가장 처음 질문입니다.'})
		// active.value = state.value.steps[2]
	} else {
		detailStep.value = state.value.detailSteps.find(el => el.order === order - 1);
	}
}

function nextDetailStep(order: number) {
	const lastOrder = state.value.detailSteps[state.value.detailSteps.length - 1].order

	if(forms.value.answer[order - 1].value == null) {
		isShowNotAnswer.value = true;
		return;
	}
	if(order === lastOrder) {
		goToKitStep();
	} else if(order === 4 && forms.value.answer[order - 1].value == 1) {
		forms.value.answer[order].value = 0;
		goToKitStep();
	} else {
		detailStep.value = state.value.detailSteps.find(el => el.order === order + 1);
	}
}
</script>

<style lang="scss" scoped>
.diagnosis {
	z-index: 1199;
	&.is-complete {
		z-index: 10050 !important;
	}
	:deep(> .page-content) {
		height: calc(100vh - 74px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
		.forms:has(.inner) {
			min-height: calc(100vh - 180px);
			display: flex;
			flex-direction: column;
			.inner {
				flex: 1;
			}
			.btns {
				position: static;
				margin-top: auto;
				width: 100%;
			}
		}
		.forms.step5 {
			min-height: calc(100vh - 180px);
			display: flex;
			flex-direction: column;
			padding-top: 20px;
			.inner {
				flex: 1;
			}
			.btns {
				position: static;
				margin-top: auto;
				width: 100%;
				display: flex;
				gap: 8px;
				:deep(.common-button) {
					flex: 1;
				}
			}
		}
	}
	&.step5-fit {
		:deep(> .page-content) {
			height: calc(100vh - 48px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
			overflow: hidden;
			display: flex;
			flex-direction: column;
			h4.title {
				flex-shrink: 0;
				padding-top: 12px;
			}
			p.desc {
				flex-shrink: 0;
			}
			.content {
				flex: 1;
				min-height: 0;
				display: flex;
				flex-direction: column;
			}
			.forms.step5 {
				flex: 1;
				min-height: 0;
				height: 100%;
				flex-wrap: nowrap;
				padding-top: 12px;
				padding-bottom: 16px;
				.inner {
					flex: 1 1 auto;
					min-height: 0;
					width: 100%;
					overflow: hidden;
					display: flex;
					flex-direction: column;
				}
				.btns {
					flex: 0 0 auto;
					margin-top: 12px;
					width: 100%;
				}
			}
		}
		:deep(.common-steps) {
			flex-shrink: 0;
			margin: 8px 0 0;
		}
	}
	.detail-box {
		width: 100%;
	}
	.box {
		background-color: var(--gray30);
		border-radius: 2px;
		padding: 16px 14px;
		width: 100%;
		b {
			font-size: var(--s14);
			font-weight: 500;
			display: block;
			color: var(--gray700);
			~ .field-radio {
				margin-top: 13px;
			}
		}
	}
	.btns {
		width: calc(100% - 40px);
		position: absolute;
		bottom: calc(26px + env(safe-area-inset-bottom, 0px));
		z-index: 10051;
		display: flex;
		align-items: center;
		justify-content: space-between;
		&:has(.gray) {
			gap: 0 8px;
		}
	}
	.field-hint {
		font-size: var(--s12);
		font-weight: 400;
		color: var(--gray600);
		margin-top: -8px;
		margin-bottom: 16px;
	}
	.field-textarea {
		margin-top: 15px;
		.field-title {
			font-size: var(--s14);
			font-weight: 500;
			margin-bottom: 8px;
			display: block;
		}
		textarea {
			width: 100%;
			min-height: 80px;
			border: 1px solid var(--gray100);
			padding: 16px;
			font-size: var(--s14);
			font-family: inherit;
			resize: vertical;
			background-color: #fff;
			color: var(--gray800);
			color-scheme: light;
			&::placeholder {
				color: var(--gray400);
				line-height: 1.5;
			}
			&:focus {
				outline: none;
			}
		}
		.validate p {
			font-size: var(--s12);
			color: var(--red);
			margin-top: 8px;
			visibility: hidden;
			&.error {
				visibility: visible;
			}
		}
	}
	.result {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 10;
		background-color: white;
		padding: calc(68px + env(safe-area-inset-top, 0px)) 20px 0;
		.title {
			margin-bottom: 27px;
			h4 {
				font-size: var(--s18);
				font-weight: 500;
				color: var(--gray800);
				margin-bottom: 2px;
			}
			p {
				font-size: var(--s16);
				font-weight: 400;
				color: var(--gray700);
				margin-top: 6px;
				:deep(b) {
					font-weight: 500;
					display: inline-block;
				}
			}
		}
		p {
			font-size: var(--s14);
			color: var(--gray700);
			font-weight: 400;
			line-height: 1.6;
		}
		ul {
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid var(--gray100);
			li {
				display: flex;
				align-items: center;
				justify-content: space-between;
				color: var(--gray700);
				font-size: var(--s16);
				font-weight: 400;
			}
		}
		.box {
			~ .box {
				margin-top: 10px;
			}
		}
	}
	:deep(.common-steps) {
		margin: 10px 0 0;
	}
	:deep(.forms) {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		padding-top: 20px;
		&.step2 {
			.btns {
				.common-button.lg {
					left: 0;
				}
				.common-button.sm {
					right: 0;
				}
			}
		}
	}
	.btn-add {
		width: calc(50% - 5px);
		height: 134px;
		border: 1px solid var(--active);
		border-radius: 6px;
		background-image: url('~/assets/img/ic_plus.svg');
		filter: var(--change_active);
	}
}
</style>