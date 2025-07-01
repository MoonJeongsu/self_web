<template>
	<div 
		class="modal fade" 
		:class="show ? 'show' : 'fade'" 
		tabindex="-1"
	>
		<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-body">
					<div class="content">
						<h5 v-if="title">{{ title }}</h5>
						<p v-if="desc" v-html="desc"/>
					</div>
					<div class="btns">
						<CommonButton
							v-if="cancelBtnTxt"
							:text="cancelBtnTxt"
							color="white"
							@click="onCancel"
						/>
						<CommonButton
							v-if="submitBtnTxt"
							:text="submitBtnTxt"
							@click="onSubmit"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	desc: {
		type: String,
		default: ''
	},
	cancelBtnTxt: {
		type: String,
		default: ''
	},
	submitBtnTxt: {
		type: String,
		default: '확인'
	},
	show: {
		type: Boolean,
		default: false
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
</script>

<style lang="scss" scoped>
.modal {
	&.show {
		display: block;
		background-color: rgba(0,0,0,0.2);
	}
	:deep(.modal-dialog) {
		text-align: center;
		h5 {
			font-size: var(--s18);
			font-weight: 500;
			padding-top: 18px;
		}
		p {
			font-size: var(--s16);
			font-weight: 400;
			color: var(--gray600);
			padding: 15px 0 30px;
		}
		.btns {
			display: flex;
			align-items: center;
			gap: 0 8px;
			justify-content: space-between;
			padding-bottom: 18px;
		}
	}
}
</style>