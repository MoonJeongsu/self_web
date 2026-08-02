<template>
	<div class="common-banners" :class="[direction]">
		<UCarousel 
			:items="list" 
			:ui="{
				item: 'basis-full snap-start snap-always',
				container: 'scroll-auto overscroll-x-contain touch-pan-x',
			}" 
			class="overflow-hidden"
			indicators
			ref="carouselRef"
		>
			<template #default="{ item }">
				<div class="content" :class="`slide${item.index}`">
					<img 
						:src="item.img" 
						class="w-full" 
						draggable="false"
					>
					<div class="txt">
						<h4 v-if="item.title" v-html="item.title"/>
						<p v-if="item.desc" v-html="item.desc"/>
					</div>
				</div>
			</template>
			<template #indicator="{ onClick, page, active }">
				<UButton 
					:variant="active ? 'solid' : 'outline'" 
					class="rounded-full justify-center" 
					@click="onClick(page)" 
				/>
			</template>
		</UCarousel>
	</div>
</template>

<script setup lang="ts">
interface BannerType {
	title: string;
	desc: string;
	img: string;
	index: number;
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
});

const carouselRef = ref<{
	$el: HTMLElement
}>()

const emits = defineEmits([
	'change'
])

let scrollContainer: HTMLElement | null = null

function getScrollContainer() {
	return carouselRef.value?.$el?.firstElementChild as HTMLElement | null
}

function emitCurrentPage() {
	if (!scrollContainer?.firstElementChild) return

	const itemWidth = (scrollContainer.firstElementChild as HTMLElement).clientWidth
	if (!itemWidth) return

	const page = Math.round(scrollContainer.scrollLeft / itemWidth) + 1
	emits('change', page)
}

function bindScrollListener() {
	const container = getScrollContainer()
	if (!container || container === scrollContainer) return

	unbindScrollListener()
	scrollContainer = container
	scrollContainer.addEventListener('scroll', emitCurrentPage, { passive: true })
	emitCurrentPage()
}

function unbindScrollListener() {
	if (!scrollContainer) return
	scrollContainer.removeEventListener('scroll', emitCurrentPage)
	scrollContainer = null
}

watch(carouselRef, bindScrollListener, { immediate: true })

onUnmounted(unbindScrollListener)
</script>

<style lang="scss" scoped>
.common-banners {
	width: 100%;

	:deep(.no-scrollbar) {
		scroll-behavior: auto;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		touch-action: pan-x;

		> div {
			scroll-snap-align: start;
			scroll-snap-stop: always;
		}
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
	:deep(div[role="tablist"]) {
		button {
			width: 8px;
			height: 8px;
			background-color: var(--active);
			&.ring-current {
				background-color: var(--gray100);
				color: var(--gray100)
			}
		}
	}
}
</style>
