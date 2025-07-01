<template>
	<div class="field-radio">
		<div 
			class="radio-box"
			v-for="(option, index) in list"
		>
			<input 
				:id="`option-${groupName}-${index}`" 
				:name="groupName"
				:value="option.value"
				type="radio"
				hidden
				:checked="modelValue === option.value"
				@change="() => onChange(option.value)"
			/>
			<label
				:for="`option-${groupName}-${index}`"
			>
				{{ option.text }}
			</label>
		</div>
	</div>
</template>

<script setup lang="ts">
interface OptionType {
	text: string,
	value: string | number
}

const props = defineProps({
	list: {
		type: Array as PropType<OptionType[]>,
		default: () => []
	},
	modelValue: {
		type: [String, Number] as PropType<string | number>,
		default: ''
	}
})
const groupName = ref(`radio-group-${Math.random().toString(36).substring(2, 10)}`)

const emits = defineEmits([
	'update:modelValue', 'change'
])

function onChange(value: string | number) {
	emits('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
.field-radio {
	.radio-box {
		display: flex;
		align-items: center;
		~ .radio-box {
			margin-top: 13px;
		}
	}
	input[type="radio"] {
		~ label {
			font-size: var(--s16);
			color: var(--gray600);
			font-weight: 400;
			display: block;
			padding-left: 34px;
			position: relative;
			&::before {
				content: '';
				width: 24px;
				height: 24px;
				background-image: url('~/assets/img/ic_radio_unchecked.svg');
				position: absolute;
				top: 50%;
				left: 0;
				transform: translateY(-50%);
			}
		}
		&:checked {
			~ label {
				&::before {
					background-image: url('~/assets/img/ic_radio_checked.svg');
				}
			}
		}
	}
}
</style>