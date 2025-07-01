<template>
	<Container
		class="guide"
		isBack
		pageTitle="앱 이용안내"
		cancelBtnTxt="FAQ"
		submitBtnTxt="자가진단 하기"
		@cancel="goFAQ"
		@submit="onSubmit"
	>
		<CommonBanners
			:list="banners"
			direction="rtl"
			@change="onChange"
		/>
		<ModalDiagnosis
			v-show="isShowDiagnosis"
			@cancel="isShowDiagnosis = false"
		/>
	</Container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import imgBanner1 from '@/assets/img/guide_sogae.png';
import imgBanner2 from '@/assets/img/guide_privacy.png';

const router = useRouter()
const banners = ref([
	{ index: 1, img: imgBanner1, title: '스마트 자가진단 앱을 소개합니다.', desc: '단계별 간단한 질문으로 답변을 통해 예상되는<br>질병을 알려드립니다.' },
	{ index: 2, img: imgBanner2, title: '수집 정보는 최소화 및 암호화 하여<br>개인정보를 보호합니다', desc: '입력하신 정보는 진단 통계 및 감염병 파악 외<br>어떠한 용도로도 사용되지 않습니다.' },
]);
//진단하기 모달
const isShowDiagnosis = ref(false);

const bannerActive = ref(1);

function onChange(val: number) {
	bannerActive.value = val;
}

function goFAQ() {
	// router.push('/faq')
}

function onSubmit() {
	isShowDiagnosis.value = true;
	//router.push('/diagnosis')
}
</script>

<style lang="scss" scoped>
.guide {
	:deep(.common-banners) {
		.content {
			height: calc(100vh - 102px);
			padding-bottom: 36px;
		}
		.slide1 {
			img {
				padding-bottom: 12px;
			}
		}
	}
	:deep(h4) {
		font-size : 1.3rem !important;
	}

	:deep(p) {
		font-size : 0.9rem !important;
	}
}
</style>