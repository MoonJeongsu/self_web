<template>
	<div class="common-banners" :class="[direction]">
		<div
			ref="viewportRef"
			class="viewport"
			@touchstart.passive="onTouchStart"
			@touchmove="onTouchMove"
			@touchend="onTouchEnd"
			@touchcancel="onTouchEnd"
			@mousedown="onMouseDown"
		>
			<div
				class="track"
				:style="trackStyle"
			>
				<div
					v-for="(item, index) in list"
					:key="item.index ?? index"
					class="slide"
				>
					<div class="content" :class="`slide${item.index}`">
						<img
							:src="item.img"
							class="w-full"
							draggable="false"
							@dragstart.prevent
						>
						<div class="txt">
							<h4 v-if="item.title" v-html="item.title" />
							<p v-if="item.desc" v-html="item.desc" />
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="indicators" role="tablist">
			<button
				v-for="(item, index) in list"
				:key="`indicator-${item.index ?? index}`"
				type="button"
				role="tab"
				:aria-selected="index === currentPage"
				:class="{ active: index === currentPage }"
				:aria-label="`set slide ${index + 1}`"
				@click="goTo(index)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
interface BannerType {
	title: string
	desc: string
	img: string
	index: number
}

const props = defineProps({
	list: {
		type: Array as PropType<BannerType[]>,
		default: () => []
	},
	direction: {
		type: String,
		default: 'ltr'
	}
})

const emits = defineEmits<{
	change: [page: number]
}>()

const viewportRef = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)

const SWIPE_THRESHOLD = 40
const SWIPE_RATIO = 0.2

let startX = 0
let startY = 0
let tracking = false
let lockHorizontal: boolean | null = null
let viewportWidth = 0

const isRtl = computed(() => props.direction === 'rtl')

const trackStyle = computed(() => {
	const dir = isRtl.value ? 1 : -1
	const base = currentPage.value * viewportWidth * dir
	const offset = dragOffset.value
	return {
		transform: `translate3d(${base + offset}px, 0, 0)`,
		transition: isDragging.value || !isAnimating.value ? 'none' : 'transform 280ms ease-out',
	}
})

function measure() {
	viewportWidth = viewportRef.value?.clientWidth || 0
}

function emitPage() {
	const item = props.list[currentPage.value]
	emits('change', item?.index ?? currentPage.value + 1)
}

function goTo(index: number, animate = true) {
	const max = Math.max(props.list.length - 1, 0)
	const next = Math.min(Math.max(index, 0), max)
	if (next === currentPage.value && dragOffset.value === 0) {
		emitPage()
		return
	}
	isAnimating.value = animate
	currentPage.value = next
	dragOffset.value = 0
	emitPage()
}

function settleFromDrag() {
	const width = viewportWidth || 1
	const delta = isRtl.value ? -dragOffset.value : dragOffset.value
	const passed = Math.abs(delta) > Math.max(SWIPE_THRESHOLD, width * SWIPE_RATIO)

	if (passed) {
		const step = delta < 0 ? 1 : -1
		goTo(currentPage.value + step, true)
	} else {
		isAnimating.value = true
		dragOffset.value = 0
	}
}

function onTouchStart(e: TouchEvent) {
	if (!e.touches[0] || props.list.length <= 1) return
	measure()
	tracking = true
	lockHorizontal = null
	isDragging.value = true
	isAnimating.value = false
	startX = e.touches[0].clientX
	startY = e.touches[0].clientY
	dragOffset.value = 0
}

function onTouchMove(e: TouchEvent) {
	if (!tracking || !e.touches[0]) return

	const dx = e.touches[0].clientX - startX
	const dy = e.touches[0].clientY - startY

	if (lockHorizontal === null) {
		if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
		lockHorizontal = Math.abs(dx) >= Math.abs(dy)
		if (!lockHorizontal) {
			tracking = false
			isDragging.value = false
			dragOffset.value = 0
			return
		}
	}

	if (!lockHorizontal) return
	e.preventDefault()

	const atFirst = currentPage.value === 0 && (isRtl.value ? dx < 0 : dx > 0)
	const atLast = currentPage.value === props.list.length - 1 && (isRtl.value ? dx > 0 : dx < 0)
	dragOffset.value = (atFirst || atLast) ? dx * 0.35 : dx
}

function onTouchEnd() {
	if (!tracking && !isDragging.value) return
	tracking = false
	isDragging.value = false
	lockHorizontal = null
	settleFromDrag()
}

function onMouseDown(e: MouseEvent) {
	if (props.list.length <= 1) return
	measure()
	tracking = true
	lockHorizontal = true
	isDragging.value = true
	isAnimating.value = false
	startX = e.clientX
	startY = e.clientY
	dragOffset.value = 0

	const onMove = (ev: MouseEvent) => {
		if (!tracking) return
		const dx = ev.clientX - startX
		const atFirst = currentPage.value === 0 && (isRtl.value ? dx < 0 : dx > 0)
		const atLast = currentPage.value === props.list.length - 1 && (isRtl.value ? dx > 0 : dx < 0)
		dragOffset.value = (atFirst || atLast) ? dx * 0.35 : dx
	}

	const onUp = () => {
		window.removeEventListener('mousemove', onMove)
		window.removeEventListener('mouseup', onUp)
		tracking = false
		isDragging.value = false
		settleFromDrag()
	}

	window.addEventListener('mousemove', onMove)
	window.addEventListener('mouseup', onUp)
}

watch(() => props.list.length, () => {
	if (currentPage.value > props.list.length - 1) {
		currentPage.value = Math.max(props.list.length - 1, 0)
	}
	emitPage()
})

onMounted(() => {
	measure()
	emitPage()
	window.addEventListener('resize', measure)
})

onUnmounted(() => {
	window.removeEventListener('resize', measure)
})
</script>

<style lang="scss" scoped>
.common-banners {
	width: 100%;
	position: relative;

	.viewport {
		width: 100%;
		overflow: hidden;
		touch-action: pan-y;
		user-select: none;
	}

	.track {
		display: flex;
		width: 100%;
		will-change: transform;
	}

	.slide {
		flex: 0 0 100%;
		width: 100%;
		min-width: 100%;
	}

	&.rtl {
		.content {
			flex-direction: column-reverse;
		}
	}

	.content {
		width: 100%;
		height: calc(100vh - 140px);
		display: flex;
		flex-direction: column;
	}

	img {
		height: calc(100vh - 280px);
		object-fit: contain;
		width: 100%;
		padding-top: 12px;
		pointer-events: none;
	}

	.txt {
		text-align: center;
		margin-top: 4px;
		h4 {
			font-size: var(--s22);
			font-weight: 700;
			color: var(--gray700);
		}
		p {
			font-size: var(--s16);
			color: var(--gray600);
			font-weight: 400;
		}
	}

	.indicators {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		z-index: 2;

		button {
			width: 8px;
			height: 8px;
			padding: 0;
			border: none;
			border-radius: 999px;
			background-color: var(--active);
			cursor: pointer;

			&.active {
				background-color: var(--gray100);
			}
		}
	}
}
</style>
