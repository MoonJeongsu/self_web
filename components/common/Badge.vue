<template>
	<span 
		class="badge"
		:class="`${size} ${color}`"
	>
		{{ text }}
	</span>
</template>

<script setup lang="ts">
const props = defineProps({
	text: {
		type: String,
		default: ''
	},
	size: {
		type: String,
		default: 'md'
	},
	color: {
		type: String,
		default: '' //default, green, red
	}
})
</script>

<style lang="scss" scoped>
.badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 20px;
	border-radius: 4px;
	background-color: var(--sub);
	color: var(--active);
	font-size: var(--s12);
	font-weight: 500;
	padding: 0 5px;
	&.sm {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
	&.md {
		padding: 0 13px;
		height: 26px;
		border-radius: 24px;
		font-weight: 500;
	}
	&.blue {
		background-color: var(--active);
		color: white;
	}
	&.light-gray {
		background-color: var(--gray100);
		color: var(--gray300);
	}
	&.green, &.red {
		border-radius: 20px;
		height: 26px;
		background-color: transparent;
	}
	&.green {
		border: 1px solid var(--green);
		color: var(--green);
		padding: 8px;
	}
	&.red {
		border: 1px solid var(--red);
		color: var(--red);
	}
}
</style>