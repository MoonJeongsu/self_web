<template>
	<div class="intro" :class="{'skyblue' : bannerActive === 1}">
		<div 
			class="splash" 
			v-if="!isShowBanner"
		>
			<img src="@/assets/img/img_splash.png">
		</div>
		<div class="banners" v-if="isShowBanner">
			<CommonBanners
				:list="banners"
				@change="onChange"
			/>
			<CommonButton
				v-if="bannerActive === 3"
				text="시작하기"
				@click="onStart"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import imgBanner1 from '@/assets/img/guide_hello.png';
import imgBanner2 from '@/assets/img/guide_simpleq.png';
import imgBanner3 from '@/assets/img/guide_privacy.png';

const router = useRouter()

const banners = ref([
	{ index: 1, img: imgBanner1, title: '안녕하세요<br>스마트 자가진단입니다.', desc: '간단한 질문을 통해 자가진단이 가능합니다.' },
	{ index: 2, img: imgBanner2, title: '간단한 질문으로 빠르게 진단', desc: '단계별 정보 입력만으로 자가진단 결과를<br>받아볼 수 있어요.' },
	{ index: 3, img: imgBanner3, title: '개인정보 보호', desc: '입력한 정보는 진단 통계 및 감염병 파악외<br>어떠한 용도로 사용되지 않습니다.' }
]);

const bannerActive = ref(1);
const isShowBanner = ref(false);

onMounted(() => {
	setTimeout(() => {
		checkAndroidForPermission();
	}, 2000);		
})

function checkAndroidForPermission() {
  if (window.AndroidBridge && AndroidBridge.checkPermission) {
      AndroidBridge.checkPermission();
  }
}

function onChange(val: number) {
	bannerActive.value = val;
}

function onStart() {
	router.push('/authority')
}
</script>

<style lang="scss" scoped>
.intro {
	height: 100vh;
	&.skyblue {
		background-color: var(--bg);
	}
	.splash {
		img {
			width : 100vw;
			height : 100vh;
			object-fit : cover;
		}
	}
	:deep(.banners) {
		padding: 48px 20px 26px;
		height: 100vh;
		position: relative;
		.slide1 {
			img {
				padding-top: 42px;
				padding-bottom: 32px;
			}
		}
		.common-button {
			position: absolute;
			bottom: 26px;
			left: 20px;
			width:calc(100% - 40px);
		}
	}
}
</style>
