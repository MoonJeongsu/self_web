<template>
	<div class="attendance-card" :class="{ complete: status.weeklyMissionCompleted }">
		<div class="attendance-head">
			<div>
				<div class="label" :class="{ done: status.weeklyMissionCompleted }">주간 출석 미션</div>
				<h3 v-html="headline"></h3>
				<div class="period">{{ status.periodLabel }}</div>
			</div>
			<span
				class="status-pill"
				:class="status.weeklyMissionCompleted ? 'done' : 'pending'"
			>
				{{ status.statusLabel }}
			</span>
		</div>

		<div class="week-calendar">
			<div class="month-label">{{ status.weekLabel }}</div>
			<div class="week-row labels">
				<span v-for="cell in weekDays" :key="`label-${cell.date}`">{{ cell.weekdayLabel }}</span>
			</div>
			<div class="week-row days">
				<span
					v-for="cell in weekDays"
					:key="`day-${cell.date}`"
					:class="{
						today: cell.isToday,
						checked: cell.isChecked,
						future: cell.isFuture && !cell.isChecked,
					}"
				>
					{{ cell.dayOfMonth }}
				</span>
			</div>
		</div>

		<p class="mission-desc" v-html="description"></p>

		<button
			v-if="!status.weeklyMissionCompleted"
			class="btn-attendance"
			type="button"
			@click="emit('check-in')"
		>
			진단하고 출석체크
		</button>
		<button
			v-else
			class="btn-attendance secondary"
			type="button"
			@click="emit('history')"
		>
			진단 이력 보기
		</button>
	</div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { WeeklyAttendanceStatus } from '~/types/attendance'
import { useAttendanceMock } from '~/composables/useAttendanceMock'

dayjs.extend(isoWeek)

const props = defineProps<{
	status: WeeklyAttendanceStatus
}>()

const emit = defineEmits<{
	'check-in': []
	history: []
}>()

const { enrichWeekDayCells } = useAttendanceMock()

const weekDays = computed(() => enrichWeekDayCells(props.status, dayjs(props.status.baseDate)))

const headline = computed(() => {
	if (props.status.weeklyMissionCompleted) {
		if (props.status.todayDiagnosed) {
			return '오늘 진단으로<br>이번 주 출석 완료!'
		}
		return '이번 주 출석을<br>완료했어요!'
	}
	return '이번 주 진단으로<br>출석을 완료해 주세요'
})

const WEEKDAY_SHORT = ['월', '화', '수', '목', '금', '토', '일']

const description = computed(() => {
	const { status, todayDiagnosed, daysRemainingInWeek, diagnosedDatesInWeek } = props.status

	if (status === 'COMPLETE') {
		const latest = diagnosedDatesInWeek[diagnosedDatesInWeek.length - 1]
		if (todayDiagnosed && latest) {
			const d = dayjs(latest)
			const wd = WEEKDAY_SHORT[d.isoWeekday() - 1]
			return `<strong>${d.format('M/D')} (${wd})</strong>에 진단을 완료하여 이번 주 출석 미션에 성공했습니다.<br>다음 주 월요일부터 새로운 미션이 시작됩니다.`
		}
		if (latest) {
			const d = dayjs(latest)
			const wd = WEEKDAY_SHORT[d.isoWeekday() - 1]
			return `이번 주 출석 미션을 완료했습니다.<br>진단일: <strong>${d.format('M/D')} (${wd})</strong>`
		}
		return '이번 주 출석 미션을 완료했습니다.'
	}

	return `<strong>1주일에 1회 이상</strong> 자가진단을 완료하면 출석 성공입니다.<br>남은 기간 <span class="highlight">D-${daysRemainingInWeek}</span> · 아직 이번 주 진단 기록이 없어요.`
})
</script>

<style lang="scss" scoped>
.attendance-card {
	background: #fff;
	border-radius: 6px;
	box-shadow: 1px 2px 8px rgba(81, 81, 81, 0.09);
	padding: 16px;
	border: 1px solid #d6eefb;

	&.complete {
		border-color: #e9e9ec;
	}
}

.attendance-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 12px;

	.label {
		font-size: 12px;
		font-weight: 700;
		color: var(--active, #3eb4eb);
		letter-spacing: -0.2px;

		&.done {
			color: #777879;
		}
	}

	h3 {
		font-size: 16px;
		font-weight: 500;
		color: #1b1b1c;
		margin-top: 4px;
		line-height: 22px;
	}

	.period {
		font-size: 12px;
		color: #777879;
		margin-top: 2px;
	}
}

.status-pill {
	flex-shrink: 0;
	padding: 4px 10px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 500;
	white-space: nowrap;

	&.pending {
		background: #fff4e5;
		color: #e67e00;
	}

	&.done {
		background: #e8f8ef;
		color: #2ecc71;
	}
}

.week-calendar {
	background: #fafafa;
	border-radius: 4px;
	padding: 12px 10px;

	.month-label {
		font-size: 12px;
		font-weight: 600;
		color: #353637;
		margin-bottom: 10px;
		padding-left: 2px;
	}
}

.week-row {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 2px;
	text-align: center;

	&.labels span {
		font-size: 11px;
		color: #777879;
		font-weight: 500;
		height: 20px;
		line-height: 20px;
	}

	&.days span {
		position: relative;
		font-size: 13px;
		color: #575758;
		height: 36px;
		line-height: 36px;

		&.today {
			color: var(--active, #3eb4eb);
			font-weight: 600;
		}

		&.checked::after {
			content: '';
			position: absolute;
			left: 50%;
			bottom: 2px;
			transform: translateX(-50%);
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: #2ecc71;
		}

		&.future {
			color: #b3b4b6;
		}
	}
}

.mission-desc {
	margin-top: 12px;
	font-size: 13px;
	line-height: 19px;
	color: #575758;

	:deep(.highlight) {
		color: var(--active, #3eb4eb);
		font-weight: 600;
	}

	:deep(strong) {
		color: #1b1b1c;
		font-weight: 500;
	}
}

.btn-attendance {
	width: 100%;
	height: 44px;
	margin-top: 14px;
	border: none;
	border-radius: 2px;
	background: var(--active, #3eb4eb);
	color: #fff;
	font-size: 14px;
	font-weight: 500;
	font-family: inherit;

	&.secondary {
		background: #eff0f3;
		color: #777879;
	}
}
</style>
