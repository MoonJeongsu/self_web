<template>
	<ul class="options">
		<li 
			v-for="(option, index) in options"
			:key="`option${index}`"
			class="is-selected"
			:class="option.text.includes(modelValue) ? 'show' : 'hide'"
			@click="onSelect(option)"
		>
			<p v-html="format.highlighted(option.text, modelValue)"/>
		</li>
	</ul>
</template>

<script setup lang="ts">
//text와 value 값이 다를 경우 대비
interface OptionType {
	text: string,
	value: string
}

const props = defineProps({
	modelValue: { //v-model 값 지정. 하이라이트를 위한 값 확인 필요
		type: String,
		default: ''
	},
	options: {
		type: Array as PropType<OptionType[]>,
		default: () => []
	}
})

const emits = defineEmits([
  	'select'
])


function onSelect(option: OptionType) {
	emits('select', option)
}
</script>