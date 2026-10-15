<template>
	<div class="form-vaccinations">
		<CommonList
			type="radio"
			:list="options.inoculations"
			:active="isVaccinated"
			@click="onSelect"
		/>
		<div v-if="isVaccinated" class="vaccination-items">
			<div
				v-for="(item, index) in vaccinations"
				:key="index"
				class="vaccination-row"
			>
				<FormInput
					title="백신 이름"
					:model-value="item.name"
					placeholder="예) 인플루엔자 백신"
					@update:model-value="value => updateItem(index, 'name', value)"
				/>
				<FormInput
					title="접종일"
					:model-value="item.date"
					placeholder="예) 2025.11 또는 2025.11.01"
					@update:model-value="value => updateItem(index, 'date', value)"
				/>
				<button
					v-if="vaccinations.length > 1"
					type="button"
					class="btn-remove"
					@click="removeItem(index)"
				>
					삭제
				</button>
			</div>
			<p v-if="error" class="error">{{ error }}</p>
			<button
				type="button"
				class="btn-add"
				@click="addItem"
			>
				접종 추가
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import options from '~/utils/options'
import { emptyVaccination, type VaccinationItem } from '~/utils/vaccination'

const props = defineProps({
	isVaccinated: {
		type: Boolean,
		default: true,
	},
	vaccinations: {
		type: Array as PropType<VaccinationItem[]>,
		default: () => [emptyVaccination()],
	},
	error: {
		type: String,
		default: '',
	},
})

const emit = defineEmits<{
	'update:isVaccinated': [value: boolean]
	'update:vaccinations': [value: VaccinationItem[]]
}>()

function onSelect(key: boolean) {
	emit('update:isVaccinated', key)
	if (key && (!props.vaccinations || props.vaccinations.length === 0)) {
		emit('update:vaccinations', [emptyVaccination()])
	}
}

function updateItem(index: number, field: keyof VaccinationItem, value: string) {
	const next = props.vaccinations.map((item, itemIndex) => (
		itemIndex === index ? { ...item, [field]: value } : item
	))
	emit('update:vaccinations', next)
}

function addItem() {
	emit('update:vaccinations', [...props.vaccinations, emptyVaccination()])
}

function removeItem(index: number) {
	const next = props.vaccinations.filter((_, itemIndex) => itemIndex !== index)
	emit('update:vaccinations', next.length ? next : [emptyVaccination()])
}
</script>

<style lang="scss" scoped>
.vaccination-items {
	margin-top: 8px;
}
.vaccination-row {
	margin-bottom: 8px;
}
.btn-add,
.btn-remove {
	border: 0;
	background: transparent;
	color: var(--active);
	font-size: var(--s14);
	font-weight: 500;
	padding: 8px 0;
}
.btn-remove {
	color: var(--gray600);
}
.error {
	font-size: var(--s12);
	color: var(--red);
	margin-top: 4px;
}
</style>
