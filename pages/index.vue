<template>
	<div class="main">
		<div class="banner"></div>
		<div class="intro">
			<b>자가 진단하기</b>
			<h2>오늘의 건강상태를 확인해주세요.</h2>
			<CommonButton
				text="시작하기"
				@click="goStart"
			/>
			<p>이미 당일 자가진단을 진행하신 경우<br>지금 진행한 자가진단 결과가 이력에 반영됩니다.</p>
		</div>
		<div class="list">
			<CommonCard
				v-for="(item, index) in state.list"
				:key="`card${index}`"
				:title="item.title"
				:desc="item.desc"
				:img="item.img"
				:bgColor="item.bgColor"
			/>
		</div>
		<ModalDiagnosis
			v-show="isShowDiagnosis"
			@cancel="isShowDiagnosis = false"
		/>
	</div>
</template>

<script setup>
import { mainApi } from '~/composables/api/main';
definePageMeta({
  	layout: 'page',
})
import cardImg1 from '@/assets/img/main_1.png';
import cardImg2 from '@/assets/img/main_2.png';
import cardImg3 from '@/assets/img/main_3.png'

const router = useRouter();
const toast = useToast()

const state = ref({
	list: [
		{ title: '개인정보가 보호됩니다.', desc: '진단 내용은 감염병 확인 여부 외<br>어떠한 용도로도 사용되지 않습니다.', img: cardImg1, bgColor: '#FEFDE6'},
		{ title: '질문에 대해 솔직하게<br>답변해주세요.', desc: '정확한 답변일수록 진단 정확도가 올라갑니다.', img: cardImg2, bgColor: '#FEF2F6'},
		{ title: '건강 이상 유무를 알려드려요.', desc: '자세한 사항은 병원에 내원하셔서<br>진단을 받아보시길 권장드립니다.', img: cardImg3, bgColor: '#EDF5FD'}
	]
})
//진단하기 모달
const isShowDiagnosis = ref(false);

onMounted(() => {
})

function goStart() {
	isShowDiagnosis.value = true;
}
const showToast = () => {
    toast.add({
        title: '성공!',
		timeout: 0
    })
}
</script>

<style lang="scss" scoped>
.main {
	.banner {
		width: 100%;
		height: 188px;
		background-color: var(--active);
		background-image: url('~/assets/img/img_main_bg.svg');
		background-size: calc(100% - 13px);
		background-position: bottom 13px left 13px;
	}
	.intro {
		width: calc(100% - 40px);
		margin: 0 20px;
		border-radius: 6px;
		box-shadow: 1px 2px 8px rgba(81, 81, 81, 0.09);
		background-color: white;
		margin-top: -46px;
		padding: 20px;
		.common-button {
			border-radius: 2px;
		}
		b {
			font-size: var(--s14);
			font-weight: 700;
			color: var(--active);
		}
		h2 {
			font-size: var(--s18);
			font-weight: 500;
			color: var(--gray800);
			margin: 8px 0 10px;
		}
		p {
			font-size: var(--s14);
			font-weight: 400;
			color: var(--gray400);
			margin-top: 14px;
		}
	}
	.list {
		padding: 0 20px;
		margin-top: 26px;
	}
}
</style>