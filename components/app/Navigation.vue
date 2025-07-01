<template>
	<div class="app-navigation">
		<div
			v-for="(item, index) in menu" 
			class="item"
			:key="`menu${index}`"
			:class="{active: item.path === route.path}"
			@click="goPage(item.path)"
		>
			<img :src="item.img">
			<p>{{ item.name }}</p>
		</div>
		<ModalNotification
			v-if="isShowNotification"
			@cancel="isShowNotification = false"
		/>
	</div>
</template>

<script setup lang="ts">
import iconMenu1 from '@/assets/img/ic_heart.svg'
import iconMenu2 from '@/assets/img/ic_book.svg'
import iconMenu3 from '@/assets/img/ic_notification.svg'
import iconMenu4 from '@/assets/img/ic_setting.svg'
import {useRoute} from 'vue-router'

const route = useRoute()

const menu = ref([
	{ name: '자가진단', img: iconMenu1, path: '/' },
	{ name: '진단이력', img: iconMenu2, path: '/history' },
	{ name: '알림', img: iconMenu3, path: '/notification' },
	{ name: '마이', img: iconMenu4, path: '/setting' }
])
//알림 팝업 모달
const isShowNotification = ref(false);

function goPage(path: string) {
	if(path.includes('notification')) {
		isShowNotification.value = true;
		return;
	} else {
		navigateTo(path)
	}
}
</script>

<style lang="scss" scoped>
.app-navigation {
	width: 100%;
	display: flex;
	align-items: center;
	height: 54px;
	justify-content: space-evenly;
	position: fixed;
	bottom: 0;
	left: 0;
	border-top: 1px solid var(--gray100);
	background-color: white;
	z-index: 100;
	.item {	
		width: 25%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		&.active {
			img {
				filter: var(--change_active);
			}
			p {
				font-weight: 700;
			}
		}
		img {
			width: 24px;
			height: 24px;
			filter: var(--change_gray200);
		}
		p {
			font-size: var(--s10);
			font-weight: 400;
			color: var(--gray700);
		}
	}
}
</style>