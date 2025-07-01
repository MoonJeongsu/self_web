<template>
	<Container 
		class="notification"
		isBack
		type="popup"
		pageTitle="알림 내역"
	>
		<div class="title">
			<b>총 <span class="blue">{{ notificationList.length }}</span>건의 알림</b>
		</div>
		<CommonCard
			size="lg"
			v-for="(item, index) in notificationList"
			:key="`notice${index}`"
			:title="item.date"
			:desc="item.text"
		/>
	</Container>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { noticeApi } from '~/composables/api/notice'
const notificationList = ref([
	
])

onMounted(() => {
	getNotice()
})


async function getNotice() {
	const endDate = dayjs().format('YYYY-MM-DD')             // 오늘 날짜
	const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD') // 한 달 전

	const res = await noticeApi.getAlarm({ startDate, endDate })

	if (res?.list) {
		notificationList.value = res.list.filter(el => el.isUnread === 1).map(el => {
			el.date = dayjs(el.datetime).format('YYYY.MM.DD');
			el.text = el.msg;
			return el;
		})
	}
}
</script>

<style lang="scss" scoped>
.notification {
	.title {
		padding: 30px 0 16px;
		b {
			font-size: var(--s16);
			font-weight: 500;
		}
	}
}
</style>