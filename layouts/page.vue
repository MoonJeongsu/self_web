<template>
	<div class="layouts">
		<slot/>
		<AppNavigation/>
	</div>
</template>

<script setup lang="ts">
//알림 팝업 모달
// const isShowNotification = ref(false);
</script>

<style lang="scss" scoped>
.layouts:not(:has(.setting)) {
	padding-bottom: 80px;
}
</style>