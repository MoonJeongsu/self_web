<template>
	<button 
		class="common-button"
		:class="[size, color]"
		:disabled="disabled"
	>
		<img v-if="icon" :src="icon">
		{{ text }}
		<slot />
	</button>
</template>

<script setup lang="ts">
const props = defineProps({
	icon: {
		type: String,
		default: ''
	},
	text: {
		type: String,
		default: ''
	},
	size: {
		type: String,
		default: ''
	},
	color: {
		type: String,
		default: ''
	},
	disabled: {
		type: Boolean,
		default: false
	}
})
</script>

<style lang="scss" scoped>
.common-button {
	width: 100%;
	height: 48px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background-color: var(--active);
	transition: 0.3s all ease-in-out;
	color: white;
	padding: 0 10px;
	font-weight: 500;
	font-size: var(--s14);
	border-radius: 2px;
	&.xs {
		width: 73px;
		height: 26px;
		border-radius: 26px;
	}
	&.sm {
		width: 89px;
	}
	&.md {
		width: 156px;
	}
	&.lg {
		width: 223px;
	}
	&.xl {
		width: calc(100% - 98px);
	}
	&.white {
		background-color: white;
		border: 1px solid var(--active);
		color: var(--active);
	}
	&.outline-black {
		background-color: white;
		color: var(--gray600);
		border: 1px solid var(--gray600);
	}
	&.gray {
		background-color: var(--gray50);
		color: var(--gray400);
	}
	&:disabled {
		background-color: var(--gray50);
		color: var(--gray400);
	}
}
</style>