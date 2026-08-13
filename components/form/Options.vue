<template>
	<ul class="select-options">
		<li
			v-for="(option, index) in options"
			:key="`option${index}`"
			class="select-option"
			:class="{ selected: option.value === modelValue }"
			@click="onSelect(option)"
		>
			<p>{{ option.text }}</p>
		</li>
	</ul>
</template>

<script setup lang="ts">
interface OptionType {
	text: string
	value: string
}

defineProps({
	modelValue: {
		type: String,
		default: ''
	},
	options: {
		type: Array as PropType<OptionType[]>,
		default: () => []
	}
})

const emits = defineEmits(['select'])

function onSelect(option: OptionType) {
	emits('select', option)
}
</script>

<style lang="scss" scoped>
.select-options {
	margin: 0;
	padding: 0;
	max-height: min(52vh, 420px);
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;

	.select-option {
		position: relative;
		display: flex;
		align-items: center;
		min-height: 52px;
		padding: 14px 36px 14px 4px;
		border-bottom: 1px solid var(--gray50);
		cursor: pointer;

		p {
			font-size: var(--s16);
			font-weight: 400;
			color: var(--gray800);
			line-height: 1.4;
		}

		&.selected {
			p {
				color: var(--active);
				font-weight: 500;
			}

			&::after {
				position: absolute;
				content: '';
				top: 50%;
				right: 4px;
				width: 24px;
				height: 24px;
				transform: translateY(-50%);
				background-image: url('~/assets/img/ic_check.svg');
				background-position: center;
				background-size: 24px;
				filter: var(--change_active);
			}
		}

		&:active {
			background-color: var(--sub);
		}
	}
}
</style>
