<template>
	<Container
		class="info-edit"
		isBack
		title="마이페이지"
	>
		<div class="menu">
			<CommonButton
				v-if="isOwner"
				text="비밀번호 변경"
				@click="goChangePassword"
			/>
			<CommonButton
				text="접종정보 추가"
				@click="goAddVaccine"
			/>
		</div>
	</Container>
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useAppToast()

const memberId = computed(() => String(route.query.memberId ?? ''))
const isOwner = computed(() => String(route.query.owner ?? '') === '1')

function goChangePassword() {
	navigateTo('/change-password')
}

function goAddVaccine() {
	if (!memberId.value) {
		toast.add({ title: '접종 대상을 확인할 수 없습니다.' })
		return
	}
	navigateTo({
		path: '/vaccine-add',
		query: { memberId: memberId.value },
	})
}
</script>

<style lang="scss" scoped>
.info-edit {
	:deep(> .page-content) {
		height: calc(100vh - 74px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
		.menu {
			min-height: calc(100vh - 180px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 16px;
			.common-button {
				width: min(280px, calc(100% - 80px));
			}
		}
	}
}
</style>
