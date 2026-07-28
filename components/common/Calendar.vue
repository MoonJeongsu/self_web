<template>
    <div class="common-calendar">
        <client-only>
            <VDatePicker
                borderless
                v-model.range="range"
				:masks="{ title: 'YYYY년 MMM' }"
                :attributes="attrs"
				:show-overflow="true"
				:first-day-of-week="2"
				@drag="dragValue = $event"
				@update:pages="onPageUpdate"
            />
        </client-only>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

// 날짜 범위 타입 정의
interface DateRange {
	start: string;
	end: string;
}

// 옵션 타입 정의 (리스트에서 달력에 전달할 데이터)
interface OptionType {
    date: Date;
    content: string;
    status: string;
}

// VDatePicker에 전달할 attribute 타입 정의
interface Attribute {
    dot: string;
    dates: Date[];
}

const props = defineProps({
	modelValue: {
		type: Object as PropType<DateRange>,
		default: () => ({
			start: dayjs().format('YYYY-MM-DD'),
			end: dayjs().format('YYYY-MM-DD')
		})
	},
	list: {
		type: Array as PropType<OptionType[]>,
		default: () => []
	}
});

const emits = defineEmits([
	'update:modelValue', 'drag', 'month-change'
])

// 내부 날짜 범위 상태
const range = ref<DateRange>({
	start: dayjs().format('YYYY-MM-DD'),
	end: dayjs().format('YYYY-MM-DD')
});

const dragValue = ref<{ start?: string; end?: string } | null>(null);
// 달력에 적용할 attributes (예: 점 표시)
const attrs = ref<Attribute[]>([]);

// range 값이 변경되면 부모로 update:modelValue 이벤트 전송
watch(range, (newRange) => {
    emits('update:modelValue', newRange);
}, { deep: true });
watch(() => dragValue.value?.start, (val) => {
	if (val) emits('drag', val);
});
watch(() => props.list, (val) => {
	changeList();
});

// 마운트 시 props로부터 초기값 세팅 및 list를 attributes로 변환
onMounted(() => {
    range.value = props.modelValue;
});

function changeList() {
    attrs.value = props.list.map((el) => ({
        dot: el.status === 'error' ? 'red' : el.status === 'success' ? 'green' : '',
        dates: [dayjs(el.date).toDate()]
    }));
}

//달 변경
function onPageUpdate(pages: { month: number; year: number }[]) {
	// pages는 배열이지만, 보통 하나만 사용됨
	const { year, month } = pages[0] // month는 1부터 시작 (1~12)
	const formatted = `${year}-${String(month).padStart(2, '0')}`
	console.log(year, month, formatted)
	emits('month-change', { year, month, formatted })
}
</script>

<style lang="scss" scoped>
.common-calendar {
    width: 100%;
	:deep(.vc-container) {
		width: 100%;
		font-size: var(--s14);
		.vc-header {
			margin: 0 0;
			padding: 0 0;
			height: 46px;
			margin-top: 20px;
			align-items: center;
			justify-content: flex-start;
			display: flex;
			.vc-arrow {
				visibility: hidden;
				width: 0;
				height: 0;
			}
			.vc-title-wrapper {
				height: 46px;
				padding: 0 0;
				display: flex;
				.vc-title {
					height: 40px;
					border-radius: 6px;
					border: 1px solid var(--gray100);
					font-size: var(--s14);
					font-weight: 600;
					color: var(--gray700);
					background-color: white;
					padding: 0 30px 0 12px;
					background-image: url('~/assets/img/ic_arrow.svg');
					background-size: 24px;
					background-position: center right 6px;
				}
			}
		}
		.vc-weekdays {
			.vc-weekday {
				padding: 0 0;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 40px;
				color: var(--gray800);
			}
		}
		.vc-day.in-month {
			height: 40px;
			color: var(--gray500);
			font-weight: 400;
		}
		.vc-highlight-bg-solid {
			width: 40px;
			height: 40px;
			background-color: var(--sub);
			color: var(--active);
		}
		.vc-highlight-content-solid {
			color: var(--active)
		}
		.vc-highlight.vc-highlight-base-start, .vc-highlight.vc-highlight-base-end, .vc-highlight.vc-highlight-base-middle {
			height: 40px;
			background-color: var(--sub);
		}
		.vc-highlight-content-light {
			color: var(--active);
		}
		.vc-dots {
			transform: translate(15px, -30px);
			.vc-dot {
				background-color: transparent;
			}
			.vc-red {
				background-color: var(--red);
			}
			.vc-green {
				background-color: var(--green);
			}
		}
	}
	:deep(.vc-monthly) {
		.is-not-in-month * {
			opacity: 1;
			color: var(--gray200);
		}
	}
}
</style>