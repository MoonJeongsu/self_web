<template>
	<div class="history">
		<Container noPadding>
			<div class="history-header">
				<h4 @click="openMemberSelector">진단이력 · {{ selected?.name }}</h4>
			</div>
			<CommonCalendar 
				v-model="range" 
				:list="allHistoryList" 
				@drag="handleDrag"
				@month-change="onMonthChange"
			/>
			<ul class="list">
				<li v-for="(item, index) in history" :key="`item${index}`">
					<div class="left">
						<div class="title">
							{{ item.title }}
							<CommonBadge v-if="item.isToday" text="오늘" size="sm" />
						</div>
						<p class="desc">{{ item.desc }}</p>
					</div>
					<div class="right">
						<CommonBadge 
							:text="item.badge?.text" 
							:color="item.badge?.color" 
							size="md"
							@click="openDiagnosisModal"
						/>
					</div>
				</li>
			</ul>

			<!-- <ModalOffcanvas 
				title="자가진단 이력" 
				isBottom 
				isArrow 
				id="history"
				:show="isShowHistory"
				@hide="isShowHistory = false"
			>
				<ul class="list">
					<li v-for="(item, index) in history" :key="`item${index}`">
						<div class="left">
							<div class="title">
								{{ item.title }}
								<CommonBadge v-if="item.isToday" text="오늘" size="sm" />
							</div>
							<p>{{ item.desc }}</p>
						</div>
						<div class="right">
							<CommonBadge 
								:text="item.badge?.text" 
								:color="item.badge?.color" 
								size="md"
								@click="goDiagnosis(item.status)"
							/>
						</div>
					</li>
				</ul>
			</ModalOffcanvas> -->

			<ModalOffcanvas
				title="사용자 선택"
				id="member"
				:show="isShowMember"
				@hide="isShowMember = false"
			>
				<ul class="member-list">
					<li 
						v-for="(member, index) in members" 
						:key="`member-${index}`"
						@click="selectMember(member)"
						:class="{ active: selected.id === member.id }"
					>
						<img :src="member.gender === 'M' ? iconMan : iconWoman">
						<p>{{ member.name }}</p>
					</li>
				</ul>
			</ModalOffcanvas>

			<ModalDiagnosis 
				v-show="isShowDiagnosis" 
				@cancel="isShowDiagnosis = false" 
			/>
		</Container>
	</div>
</template>

<script setup lang="ts">
import type {MemberInfoType} from '~/types'
import dayjs from 'dayjs'
import { selfTestApi } from '~/composables/api/selftest'
import { memberApi } from '~/composables/api/member'
import iconWoman from '@/assets/img/ic_woman.svg'
import iconMan from '@/assets/img/ic_man.svg'

definePageMeta({ layout: 'page' });

interface HistoryItem {
	date: Date;
	content: string;
	status: string;
	isToday?: boolean;
	title?: string;
	desc?: string;
	badge?: { color: string; text: string };
}

interface DateRange {
	start: string;
	end: string;
}

const today = dayjs().format('YYYY-MM-DD')
const selectMonth = ref(dayjs().format('YYYY-MM'))
const range = ref<DateRange>({ start: today, end: today })

const allHistoryList = ref<HistoryItem[]>([])
const members = ref<MemberInfoType[]>([])
const selected = ref<MemberInfoType>({ id: '', name: '', gender: '', birthDate: '', isComplete: 'Y' })

const isShowHistory = ref(false)
const isShowMember = ref(false)
const isShowDiagnosis = ref(false)

// 라이프사이클
onMounted(async () => {
	selectMonth.value = dayjs().format('YYYY-MM')
	resetRangeToToday()

	await getMembers()
	selected.value = members.value[0]
	await getHistory(selected.value?.id)
})

// 반응형 처리
watch(selected, async () => {
	await getHistory(selected.value.id)
}, { deep: true })

watch(range, () => {
	isShowHistory.value = true
}, { deep: true })

// 날짜 유틸
function getMonthRange(month: string) {
	const base = dayjs(`${month}-01`)
	return {
		startDate: base.startOf('month').format('YYYY-MM-DD'),
		endDate: base.endOf('month').format('YYYY-MM-DD')
	}
}

function resetRangeToToday() {
	const today = dayjs().format('YYYY-MM-DD')
	range.value = { start: today, end: today }
}

// 진단 이력 필터링
const history = computed(() => {
	return allHistoryList.value.filter(item => {
		const dateStr = dayjs(item.date).format('YYYY-MM-DD')
		const startStr = dayjs(range.value.start).format('YYYY-MM-DD')
		const endStr = dayjs(range.value.end).format('YYYY-MM-DD')
		return dateStr >= startStr && dateStr <= endStr
	})
})

// 진단 이력 포맷
function formatHistoryItem(item: HistoryItem): HistoryItem {
	const isToday = dayjs(item.date).isSame(dayjs(), 'day')
	const title = dayjs(item.date).format('YYYY-MM-DD')
	const desc = item.status === 'default' ? '진단결과가 없습니다.' : '자가진단 진행 완료'
	const badge = {
		color: item.status === 'error' ? 'red' : item.status === 'success' ? 'green' : 'blue',
		text: item.status === 'error' ? '호흡기 질환' : item.status === 'success' ? '정상' : '진단하기'
	}
	return { ...item, isToday, title, desc, badge }
}

function mapStatus(testResult: string): string {
	switch (testResult) {
		case 'STATUS_DANGER': return 'error'
		case 'STATUS_OK': return 'success'
		default: return 'default'
	}
}

function mapSelfTestDataToHistoryItems(apiData: Record<string, any[]>): HistoryItem[] {
	const result: HistoryItem[] = []
	for (const dateKey in apiData) {
		apiData[dateKey].forEach(test => {
			result.push({
				date: new Date(dateKey),
				status: mapStatus(test.testResult),
				content: test.testResult === 'STATUS_DANGER' ? '진단결과가 없습니다' : '자가진단 진행 완료'
			})
		})
	}
	return result.map(formatHistoryItem)
}

// API 호출
async function getMembers() {
	const res = await memberApi.getMembers()
	if (res) members.value = res.list
}

async function getHistory(memberId: string) {
	const { startDate, endDate } = getMonthRange(selectMonth.value)
	const res = await selfTestApi.getSelfTest({ memberId, startDate, endDate })
	const historyData = (res as { data?: Record<string, unknown[]> })?.data ?? res
	if (historyData) allHistoryList.value = mapSelfTestDataToHistoryItems(historyData as Record<string, { testResult: string }[]>)
}

// 이벤트 핸들러
function onMonthChange({ year, month, formatted }: { year: number; month: number; formatted: string }) {
	if (selectMonth.value !== formatted) {
		selectMonth.value = formatted
		getHistory(selected.value.id)
	}
}

function selectMember(member: MemberInfoType) {
	selected.value = member
	setTimeout(() => { isShowMember.value = false }, 300)
}

function openMemberSelector() {
	isShowHistory.value = false
	isShowMember.value = true
}

function openDiagnosisModal() {
	isShowHistory.value = false
	isShowMember.value = false
	isShowDiagnosis.value = true
}

function handleDrag() {
	isShowHistory.value = false
}
</script>

<style lang="scss" scoped>
.history {
	> .page-container {
		:deep(> .page-header) {
			display: none;
		}
		:deep(.page-content) {
			height: calc(100vh - 54px);
		}
	}
	.history-header {
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: white;
		h4 {
			background-image: url('~/assets/img/ic_arrow.svg');
			background-repeat: no-repeat;
			background-position: center right 0;
			padding-right: 24px;
			background-size: 24px;
		}
	}
	.common-calendar {
		padding: 0 20px 18px;
		background-color: white;
		:deep(.vc-weeks) {
			padding: 0 0;
		}
	}
	.list {
		padding-top: 8px;
		li {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			padding: 12px 20px;
			border-bottom: 1px solid var(--gray100);
			background-color: white;
			.title {
				font-size: var(--s14);
				font-weight: 500;
				color: var(--gray500);
				.badge.sm {
					width: 38px;
					border-radius: 4px;
					margin-left: 4px;
				}
			}
			.desc {
				font-size: var(--s14);
				font-weight: 400;
				color: var(--gray700);
			}
		}
	}
	:deep(.common-offcanvas) {
		.member-list li {
			display: flex;
			align-items: center;
			position: relative;
			height: 40px;
			&.active {
				padding: 0 10px;
				+ li {
					margin-top: 10px;
				}
				&::before {
					position: absolute;
					content: '';
					top: 50%;
					right: 10px;
					width: 24px;
					height: 24px;
					background-image: url('~/assets/img/ic_check.svg');
					background-position: center right 0;
					background-size: 24px;
					transform: translateY(-50%);
					filter: var(--change_active);
				}
				&::after {
					position: absolute;
					content: '';
					top: 0;
					left: 0;
					width: 100%;
					height: 40px;
					border: 1px solid var(--active);
					border-radius: 2px;
				}
			}
			img {
				width: 24px;
				height: 24px;
				margin-right: 10px;
			}
			p {
				font-size: var(--s14);
				font-weight: 400;
				color: var(--gray700);
			}
		}
	}
}
</style>
