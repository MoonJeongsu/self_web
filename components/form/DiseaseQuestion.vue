<template>
	<div class="disease-question">
		<b>{{ order }}. {{ question }}</b>
		<FormRadio
			:list="answers"
			:model-value="modelValue"
			@update:model-value="emits('update:modelValue', $event)"
		/>
	</div>
</template>

<script setup lang="ts">
const answers = [
	{ text: '예', value: 0 },
	{ text: '아니오', value: 1 },
	{ text: '모름', value: 2 },
]

defineProps({
	order: {
		type: [String, Number],
		required: true,
	},
	question: {
		type: String,
		required: true,
	},
	modelValue: {
		type: [Number, String] as PropType<number | string | null>,
		default: null,
	},
})

const emits = defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
.disease-question {
	background-color: var(--gray30);
	border-radius: 2px;
	padding: 16px 14px;
	width: 100%;
	b {
		font-size: var(--s14);
		font-weight: 500;
		display: block;
		color: var(--gray700);
		:deep(~ .field-radio) {
			margin-top: 13px;
		}
	}
	:deep(.field-radio) {
		margin-top: 13px;
	}
}
</style>
