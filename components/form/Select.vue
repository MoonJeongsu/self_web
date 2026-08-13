<template>
	<div class="field field-select" :class="{ 'is-open': isOpen, 'is-value': !!modelValue }">
		<label class="field-title" v-if="title">{{ title }}</label>
		<button
			type="button"
			class="select-trigger"
			:disabled="disabled"
			@click="openSheet"
		>
			<span :class="{ placeholder: !displayText }">
				{{ displayText || formatPlaceholder }}
			</span>
			<i class="chevron" aria-hidden="true" />
		</button>

		<ModalOffcanvas
			:id="sheetId"
			:title="title"
			:show="isOpen"
			@hide="closeSheet"
		>
			<FormOptions
				:modelValue="modelValue"
				:options="options"
				@select="onSelect"
			/>
		</ModalOffcanvas>
	</div>
</template>

<script setup lang="ts">
interface OptionType {
	text: string
	value: string
}

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	modelValue: {
		type: String,
		default: ''
	},
	placeholder: {
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

const emits = defineEmits(['update:modelValue', 'select'])

const isOpen = ref(false)
const uid = useId()
const sheetId = computed(() => `form-select-${uid}`)

const displayText = computed(() => {
	const found = props.options.find((option) => option.value === props.modelValue)
	return found?.text || ''
})

const formatPlaceholder = computed(() => {
	if (props.placeholder) {
		return props.placeholder
	}
	if (props.title) {
		return `${format.checkBatchimEnding(props.title)} 선택해주세요`
	}
	return '선택해주세요'
})

function openSheet() {
	if (props.disabled) return
	isOpen.value = true
}

function closeSheet() {
	isOpen.value = false
}

function onSelect(option: OptionType) {
	if (!option?.value) return
	emits('update:modelValue', option.value)
	emits('select', option)
	closeSheet()
}
</script>

<style lang="scss" scoped>
.field-select {
	width: 100%;

	.field-title {
		font-size: var(--s14);
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}

	.select-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 56px;
		padding: 0 16px;
		border: 1px solid var(--gray100);
		background-color: #fff;
		text-align: left;
		cursor: pointer;

		span {
			flex: 1;
			min-width: 0;
			font-size: var(--s14);
			font-weight: 400;
			color: var(--gray800);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&.placeholder {
				color: var(--gray400);
			}
		}

		.chevron {
			flex-shrink: 0;
			width: 24px;
			height: 24px;
			margin-left: 8px;
			background-image: url('~/assets/img/ic_arrow.svg');
			background-size: 24px;
			background-position: center;
			transition: transform 0.2s ease;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	&.is-open .select-trigger .chevron {
		transform: rotate(180deg);
	}

	~ .field {
		margin-top: 15px;
	}
}
</style>
