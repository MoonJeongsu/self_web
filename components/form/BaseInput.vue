<template>
	<div 
		class="field"
		:class="[
			type,
			{'is-focus' : isFocus },
			{'is-value' : modelValue }
		]"
		v-click-outside="clickOutSide" 
	>
		<label class="field-title" v-if="title">
			{{title}}
		</label>
		<div class="input-box">
			<input
				:type="inputType"
				:class="modelValue.length === 0 ? 'empty' : ''"
				:placeholder="placeholder"
				:disabled="disabled"
				:readonly="readonly"
				autocomplete="off"
				:value="modelValue"
				@input="onInput"
				@change="onChange"
				@focus="onFocus"
				@keyup.enter="onSearch"
			/>
			<!--단위가 있을 때만-->
			<p v-if="unit" class="unit">{{ unit }}</p>
		</div>
		<slot/>
	</div>
</template>

<script setup lang="ts">
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
	disabled: { 
		type: Boolean,
		default: false
	},
	readonly: {
		type: Boolean,
		default: false
	},
	formKey: {
		type: String,
		default: ''
	},
	unit: {
		type: String,
		default: ''
	}
})

const emits = defineEmits([
  'update:modelValue', 'input', 'change', 'focus', 'search'
])

//input focus (옵션 리스트 toggle 설정)
const isFocus = ref(false);
//input 입력창 type
const inputType = ref('')

onMounted(() => {
	//input type 값 지정 : 각 타입마다 필요한 세팅값이 다름
	if(props.type) {
		if(props.type === 'select') {
			inputType.value = 'text'
		} else {
			inputType.value = props.type
		}
	}
})

function onInput(event: Event) {
	const target = event.target as HTMLInputElement;
	emits('update:modelValue', target.value);
	emits('input', target.value);
}

function onChange(event: Event) {
	const target = event.target as HTMLInputElement;
	emits('change', target.value);
}

function onFocus() {
	isFocus.value = true;
	emits('focus', isFocus.value)
}

//element 외 클릭 시 focus 제거
function clickOutSide() {
	isFocus.value = false;
	emits('focus', isFocus.value)
}

//검색 기능
function onSearch() {
	emits('search', props.modelValue)
}
</script>

<style lang="scss" scoped>
.field {
	width: 100%;
	&:has(.common-button) {
		position: relative;
		.input-box {
			width: calc(100% - 72px);
		}
		:deep(.common-button) {
			width: 63px;
			position: absolute;
			top: 29px;
			right: 0;
			height: 56px;
		}
	}
	.field-title {
		font-size: var(--s14);
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}
	.input-box {
		display: flex;
		align-items: center;
		width: 100%;
		border: 1px solid var(--gray100);
		height: 56px;
		padding: 0 16px;
		position: relative;
		overflow: hidden;
		input {
			border: 0;
			background-color: transparent;
			border-radius: 0;
			height: calc(100% - 2px);
			margin-top: 1px;
			width: 100%;
			font-size: var(--s14);
			font-weight: 400;
			&:focus, &:focus-visible {
				border: transparent;
				outline: 0;
			}
			&::placeholder {
				color: var(--gray400);
				font-weight: 400;
			}
		}
		~ button {

		}
	}
	~ .field {
		margin-top: 15px;
	}
}
</style>