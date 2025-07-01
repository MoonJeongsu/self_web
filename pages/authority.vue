<template>
	<Container 
		class="authority"
		title="원활한 서비스 이용을 위해<br>앱권한에 동의 해주세요."
		desc="아래 권한을 동의하셔야 앱 이용이 가능합니다."
		submitBtnTxt="동의하기"
		@submit="goPage"
	>
		<ul>
			<li>
				<img class="icon" src="@/assets/img/ic_location.svg">
				<div class="txt">
					<b>위치</b>
					<p>진단 후 인근 의료기관 안내</p>
				</div>
			</li>
			<li>
				<img class="icon" src="@/assets/img/ic_upload.svg">
				<div class="txt">
					<b>업로드</b>
					<p>의료기관에 진단 결과를 업로드해<br>통계 자료 제공</p>
				</div>
			</li>
			<li>
				<img class="icon" src="@/assets/img/ic_save.svg">
				<div class="txt">
					<b>저장공간</b>
					<p>내 진단 결과 저장</p>
				</div>
			</li>
		</ul>
	</Container>
</template>

<script setup>
import {useRouter} from 'vue-router';

const router = useRouter()

//동의하기
function goPage() {
	// navigateTo('login')
	askAndroidForPermission();
}

function askAndroidForPermission() {
  if (window.AndroidBridge && AndroidBridge.grantPermission) {
      AndroidBridge.grantPermission();
  }
}
</script>

<style lang="scss" scoped>
.authority {
	position: relative;
	:deep(ul) {
		display: flex;
		flex-direction: column;
		margin-top: 14px;
		li {
			display: flex;
			align-items: start;
			margin-top: 20px;
			img {
				width: 24px;
				filter: var(--change_active);
				margin-top: 5px;
			}
			.txt {
				margin-left: 14px;
				b {
					font-size: var(--s14);
					color: var(--gray700);
					font-weight: 500;
				}
				p {
					font-size: var(--s14);
					color: var(--gray600);
					font-weight: 400;
				}
			}
		}
	}
}
</style>