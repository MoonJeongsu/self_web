<template>
	<div class="form-check form-switch">
		<input 
			class="form-check-input" 
			type="checkbox" 
			role="switch" 
			:id="id"
			:checked="modelValue"
			@change="onChange"
		>
		<label 
			class="form-check-label" 
			:for="id"
		></label>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	id: {
		type: String,
		default: 'check-switch' // 기본 ID 값 설정
	}
})

const emits = defineEmits(['update:modelValue']);

// ID가 없을 경우 기본값 설정
const switchId = computed(() => props.id || 'check-switch');

function onChange(event: Event) {
	const target = event.target as HTMLInputElement;
	emits('update:modelValue', target.checked); // `checked`를 Boolean 값으로 전달
}
</script>

<style lang="scss">
.form-check.form-switch {
	display: flex;
	align-items: center;
}
.form-check-input {
	&:checked {
		background-color: var(--active);
		border-color: var(--active)
	}
}
</style>