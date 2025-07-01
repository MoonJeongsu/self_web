<template>
	<Container
		class="search-addr"
		isBack
		type="popup"
		@cancel="onClose"
		v-show="show"
		noPadding
	>
		<div ref="wrap" style="width:100%; height: 100%"></div>
	</Container>
</template>

<script setup lang="ts">
const props = defineProps<{
	show: boolean;
}>();

const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'select', payload: string): void;
}>();

const wrap = ref<HTMLDivElement | null>(null);

watch(() => props.show, (val) => {
	if (val && window.daum) {
		new window.daum.Postcode({
			oncomplete(data: any) {
				const selectedAddress = data.userSelectedType === "R"
					? data.roadAddress
					: data.jibunAddress;

				emit('select', selectedAddress);
				emit('close');
			},
			width: "100%",
			height: "100%"
		}).embed(wrap.value);
	}
});

function onClose() {
	emit('close');
}
</script>

<style lang="scss" scoped>
.search-addr {
	:deep(.page-header) {
		width: calc(100% - 40px);
		margin: 0 auto;
	}
	:deep(.page-content) {
		height: calc(100vh - 48px);
	}
}
</style>