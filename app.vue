<template>
	<NuxtLayout>
		<UNotifications
			:ui="{
				position: 'absolute bottom-[80px] left-1/2 -translate-x-1/2',
				container: 'max-w-md w-full space-y-0',
				item: {
					close: 'hidden'
				}
			}"
			class="custom-toast"
		/>
		<NuxtPage />
	</NuxtLayout>
</template>
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mainApi } from '~/composables/api/main'

const route = useRoute()

onMounted(async () => {
    const allowList = ['/intro', '/authority', '/splash', '/signup']
	const fcmToken = (window.AndroidBridge && AndroidBridge.getFcmToken())
	            ? AndroidBridge.getFcmToken() : '';
	
	try {
		if (!allowList.includes(route.path)) {
			const res = await mainApi.updateFcm({fcmToken});
		}
	} catch(e) {
		console.log(e)
		navigateTo('/login')	
	}
})

watch(() => route.path, async (val) => {
  // 예외 경로 목록
	const allowList = ['/intro', '/authority', '/splash', '/signup']
	const fcmToken = (window.AndroidBridge && AndroidBridge.getFcmToken())
	            ? AndroidBridge.getFcmToken() : '';
	
	try {
		if (!allowList.includes(route.path)) {
			const res = await mainApi.updateFcm({fcmToken});
		}
	} catch(e) {
		console.log(e)
		navigateTo('/login')	
	}
})
</script>
<style>
@import url('~/assets/scss/index.scss');
.custom-toast {
	box-shadow: unset;
	z-index: 9999;
	.ring-gray-200{
		background-color: rgba(0,0,0,0.7);
		border-radius: 50px;
		color: white;
		border: 0;
		.p-4 {
			padding: 10px 0 !important;
		}
		p {
			color: white;
			text-align: center;
		}
		.flex-shrink-0 {
			display: none;
		}
	}
}
.bg-primary-500 {
	background-color: transparent !important;
}
</style>