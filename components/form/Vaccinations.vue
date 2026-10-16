<template>
	<div class="form-vaccinations">
		<CommonList
			type="radio"
			:list="inoculationList"
			:active="isVaccinated"
			@click="onSelect"
		/>
		<div v-if="isVaccinated" class="field-textarea">
			<label class="field-title">백신접종 정보 입력</label>
			<textarea
				:value="modelValue"
				placeholder="예시) 인플루엔자 백신 3가, 4가 2025.11.1 접종&#10;예시)RSV 백신 2026.08.01 접종"
				@input="onInput"
			/>
			<div class="validate">
				<p :class="error ? 'error' : ''">{{ error }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import options from '~/utils/options'

const props = defineProps({
	isVaccinated: {
		type: Boolean,
		default: true,
	},
	modelValue: {
		type: String,
		default: '',
	},
	error: {
		type: String,
		default: '',
	},
	disableUnvaccinated: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits<{
	'update:isVaccinated': [value: boolean]
	'update:modelValue': [value: string]
}>()

const inoculationList = computed(() =>
	options.inoculations.map(item => ({
		...item,
		disabled: props.disableUnvaccinated && item.key === false,
	}))
)

function onSelect(key: boolean) {
	if (props.disableUnvaccinated && key === false) return
	emit('update:isVaccinated', key)
	if (!key) {
		emit('update:modelValue', '')
	}
}

function onInput(event: Event) {
	const target = event.target as HTMLTextAreaElement
	emit('update:modelValue', target.value)
}
</script>

<style lang="scss" scoped>
.field-textarea {
	margin-top: 15px;
	.field-title {
		font-size: var(--s14);
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}
	textarea {
		width: 100%;
		min-height: 80px;
		border: 1px solid var(--gray100);
		padding: 16px;
		font-size: var(--s14);
		font-family: inherit;
		resize: vertical;
		background-color: #fff;
		color: var(--gray800);
		color-scheme: light;
		&::placeholder {
			color: var(--gray400);
			line-height: 1.5;
		}
		&:focus {
			outline: none;
		}
	}
	.validate p {
		font-size: var(--s12);
		color: var(--red);
		margin-top: 8px;
		visibility: hidden;
		&.error {
			visibility: visible;
		}
	}
}
</style>
