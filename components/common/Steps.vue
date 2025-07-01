<template>
	<div class="common-steps">
		<CommonBadge
			v-for="(item, index) in list"
			:key="`tab${index}`"
			size="sm"
			:text="String(item.order)"
			:color="active === item.order ? 'blue' : 'light-gray'"
			:class="{active : active === item.order}"
		/>
	</div>
</template>

<script setup lang="ts">
interface ItemType {
	text?: string,
	order: number
}

const props = defineProps({
	list: {
		type: Array as PropType<ItemType[]>,
		default: () => []
	},
	active: {
		type: Number,
		default: 1
	}
})
</script>

<style lang="scss" scoped>
.common-steps {
	display: flex;
	align-items: center;
	gap: 0 4px;
}
</style>