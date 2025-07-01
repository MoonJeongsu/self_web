<template>

</template><template>
	<FormBaseInput
		class="field-select"
		type="text"
		:modelValue="modelValue"
		:title="title"
		:required="required"
		:disabled="disabled"
		:readonly="true"
		:placeholder="formatPlaceholder"
		:isCol="isCol"
		@focus="onFocus"
	>
		<FormOptions
			v-if="options && isFocus"
			:modelValue="modelValue"
			:options="options"
			@select="onSelect"
		/>
	</FormBaseInput>
</template>

<script setup lang="ts">
//text와 value 값이 다를 경우 대비
interface OptionType {
	text: string,
	value: string
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
	isCol: {
		type: Boolean,
		default: false
	},
	options: {
		type: Array as PropType<OptionType[]>,
		default: () => []
	}
})

const isFocus = ref(false);

//init
onMounted(() => {
	isFocus.value = false;
})

//placeholder 자동완성
const formatPlaceholder = computed(() => {
	const text = props.title;
	if(props.placeholder) {
		return props.placeholder
	}
	if(text) {
		return `${format.checkBatchimEnding(text)} 선택해주세요`
	}
})

const emits = defineEmits([
  	'update:modelValue', 'select'
])

//옵션 선택
function onSelect(option: OptionType) {
	if(option.value) {
		isFocus.value = false;
		emits('select', option)
	}
}

//focus
function onFocus(value: boolean) {
	isFocus.value = value;
}
</script>

<style lang="scss" scoped>
.field-select {
	width: 100%;
	position: relative;
}
</style>