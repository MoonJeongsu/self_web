<template>
	<div 
		class="page-container" 
		:class="[{'no-padding' : noPadding}, type]"
	>
		<div class="page-header">
			<button 
				v-if="isBack" 
				class="btn-back"
				@click="goBack"
			/>
			<h5 
				v-if="pageTitle"
				class="page-title"
			>
				{{ pageTitle }}
			</h5>
			<slot name="page-title"/>
		</div>
		<div class="page-content">
			<slot name="content-top"/>
			<h4 
				v-if="title" 
				class="title" 
				v-html="title"
			/>
			<p 
				v-if="desc" 
				class="desc" 
				v-html="desc"
			/>
			<slot/>
		</div>
		<div class="page-footer">
			<CommonButton
				v-if="cancelBtnTxt"
				:text="cancelBtnTxt"
				color="white"
				@click="onCancel"
			/>
			<CommonButton
				v-if="submitBtnTxt"
				:text="submitBtnTxt"
				:disabled="disabled"
				@click="onSubmit"
			/>
		</div>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
	pageTitle: {
		type: String,
		default: ''
	},
	title: {
		type: String,
		default: ''
	},
	desc: {
		type: String,
		default: ''
	},
	isBack: {
		type: Boolean,
		default: false
	},
	cancelBtnTxt: {
		type: String,
		default: ''
	},
	submitBtnTxt: {
		type: String,
		default: ''
	},
	disabled: {
		type: Boolean,
		default: false
	},
	noPadding: {
		type: Boolean,
		default: false
	},
	type: {
		type: String,
		default: ''
	}
})

const emits = defineEmits([
	'submit', 'cancel'
])

function onSubmit() {
	emits('submit')
}

function onCancel() {
	emits('cancel')
}

//뒤로 가기
function goBack() {
	if(props.type === 'popup') {
		emits('cancel')
	} else {
		router.go(-1)
	}
}
</script>

<style lang="scss" scoped>
.page-container {
	width: 100%;
	padding: 0 20px 0px;
	height: 100vh;
	&.no-padding {
		padding: 0 0;
		background-color: var(--gray50);
	}
	&.popup {
		position: fixed;
		z-index: 999;
		top: 0;
		left: 0;
		background-color: white;
	}
	.page-header {
		width: 100%;
		height: 48px;
		margin-top: env(safe-area-inset-top, 0px);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background-color: white;
		.btn-back {
			width: 24px;
			height: 24px;
			background-image: url('~/assets/img/ic_back.svg');
			background-size: 100%; 
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
		}
		.page-title {
			font-size: var(--s16);
			font-weight: 500;
		}
	}
	.page-content {
		height: calc(100vh - 102px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		h4.title {
			font-size: var(--s18);
			font-weight: 500;
			color: var(--gray800);
			padding-top: 20px;
		}
		p.desc {
			font-size: var(--s16);
			font-weight: 400;
			color: var(--gray700);
			margin-top: 6px;
			line-height: 1.5;
			word-break: keep-all;
			:deep(b) {
				font-weight: 500;
				display: inline-block;
			}
		}
	}
	.page-footer {
		display: flex;
		gap: 0 8px;
		&:has(.common-button) {
			padding-bottom: env(safe-area-inset-bottom, 0px);
		}
	}
}
</style>