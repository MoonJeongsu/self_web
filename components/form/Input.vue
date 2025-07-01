<template>
	<FormBaseInput
		class="field-input"
		:class="validate?.status"
		:title="title"
		:modelValue="modelValue"
		:type="type"
		:required="required"
		:disabled="disabled"
		:placeholder="formatPlaceholder"
		:isCol="isCol"
		:formKey="formKey"
		:btnText="btnText"
		:label="label"
		:unit="unit"
		@input="onInput"
		@change="onChange"
		@submit="onSubmit"
	>
		<!--버튼이 있을 때만-->
		<CommonButton
			v-if="btnText"
			:text="btnText"
			:disabled="disabled"
			@click="onSubmit"
		/>
		<div class="validate">
			<p
				v-text="validate?.status === 'success' ? validate?.successTxt : validate?.text"
				:class="validate?.status"
			></p>
		</div>
	</FormBaseInput>
</template>

<script setup lang="ts">
interface ValidateType {
	text: string;
	status?: string;
	successTxt?: string
}

const props = defineProps({
	title: { //레이블
		type: String,
		default: ''
	},
	modelValue: { //v-model 값 지정
		type: String,
		default: ''
	},
	type: { //form type
		type: String,
		default: 'text'
	},
	placeholder: { // 기본은 title 기준 placeholder 세팅. custom 하고 싶을 때 사용 
		type: String,
		default: ''
	},
	required: {
		type: Boolean,
		default: false
	},
	disabled: { 
		type: Boolean,
		default: false
	},
	validate: { 
		type: Object as PropType<ValidateType>,
		default: () => {}
	},
	isCol: {
		type: Boolean,
		default: false
	},
	formKey: {
		type: String,
		default: ''
	},
	btnText: {
		type: String,
		default: ''
	},
	unit: {
		type: String,
		default: ''
	},
	label: {
		type: String,
		default: ''
	}
})

const emits = defineEmits([
  'update:modelValue', 'input', 'submit', 'change'
])

//placeholder 자동완성
const formatPlaceholder = computed(() => {
	const text = props.title;
	//개별 입력한 placeholder 있을 경우
	if(props.placeholder) {
		return props.placeholder
	}
	if(text) {
		return `${format.checkBatchimEnding(text)} 입력해주세요`
	}
})

function onInput(value: string) {
	emits('update:modelValue', value);
}

function onChange(value: string) {
	emits('change', value, props.formKey, props.validate);
}

//버튼 클릭
function onSubmit() {
	emits('submit', props.modelValue, props.formKey, props.validate)
}
</script>

<style lang="scss" scoped>
.field-input {
	:deep(.validate) {
		margin-top: 8px;
		p {
			font-size: var(--s12);
			font-weight: 400;
			color: var(--gray800);
			visibility: hidden;
			&.error {
				color: var(--red);
				visibility: visible;
			}
			&.success {
				color: var(--green);
				visibility: visible;
			}
		}
	}	
}
</style>