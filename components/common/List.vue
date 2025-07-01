<template>
	<div class="common-list" :class="[type]">
		<div 
			class="no-content"
			v-if="noContentTxt && list.length === 0"
			v-html="noContentTxt"
		>
		</div>
		<label class="field-title" v-if="title">{{ title }}</label>
		<ul>
			<li 
				v-for="(item, index) in list"
				:key="`item${index}`"
				class="list-item"
				@click="onClick(item?.key ?? '')"
				:class="[{active: active === item.key}, {selected: selected.includes(item.key)}]"
			>
				<div class="left">
					<img v-if="item.img" :src="item.img"/>
					<p v-html="item.title" />
				</div>
				<p class="right">
					{{ item.desc }}
					<slot/>
				</p>
			</li>
		</ul>
		<div class="validate">
			<p
				v-text="validate?.status === 'success' ? validate?.successTxt : validate?.text"
				:class="validate?.status"
				v-if="validate?.text"
			></p>
		</div>
	</div>
</template>

<script setup lang="ts">
interface ValidateType {
	text: string;
	status?: string;
	successTxt?: string
}

interface ItemType {
	img?: string,
	title: string,
	desc?: string,
	isClick?: boolean,
	key?: string | boolean
}

const props = defineProps({
	list: {
		type: Array as PropType<ItemType[]>,
		default: () => []
	},
	noContentTxt: {
		type: String,
		default: ''
	},
	active: {
		type: String || Boolean,
		default: ''
	},
	type: {
		type: String,
		default: ''
	},
	selected: {
		type: Array,
		default: () => []
	},
	validate: { 
		type: Object as PropType<ValidateType>,
		default: () => {}
	},
	title: {
		type: String,
		default: ''
	}
})

const emits = defineEmits([
	'click'
])

function onClick(key: string) {
	if(key !== null) {
		emits('click', key)
	}
}
</script>

<style lang="scss" scoped>
.common-list {
	width: 100%;
	.no-content {
		width: 100%;
		background-color: var(--gray30);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 14px;
		font-size: var(--s14);
		font-weight: 400;
		color: var(--gray600)
	}
	label.field-title {
		font-size: var(--s14);
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}
	&.select {
		ul {
			li {
				height: 56px;
				width: 100%;
				border: 1px solid var(--gray100);
				padding: 0 14px;
				color: var(--gray400);
				position: relative;
				border-radius: 2px;
				&.selected {
					background-color: var(--sub);
					border-color: var(--active);
					color: var(--active);
					&::after {
						width: 24px;
						height: 24px;
						content: '';
						background-image: url('~/assets/img/ic_check.svg');
						filter: var(--change_active);
					}
				}
			}
		}
	}
	&.radio {
		ul {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-direction: row;
			li {
				width:calc(50% - 4px);
				border-radius: 2px;
				height: 56px;
				border: 1px solid var(--gray100);
				color: var(--gray400);
				justify-content: center;
				&.active {
					background-color: var(--sub);
					border-color: var(--active);
					color: var(--active);
				}
			}
		}
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 10px 0;
		:deep(li) {
			&:has(p > span) {
				align-items: flex-start;
			}
		}
		li {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: var(--s14);
			font-weight: 400;
			color: var(--gray700);
			.left {
				display: inline-flex;
				align-items: center;
				color: inherit;
				img {
					margin-right: 8px;
				}
				:deep(p) {
					font-size: var(--s14);
					font-weight: 400;
					color: inherit;
					color: var(--gray600);
					span {
						color: var(--active);
						display: block;
						font-size: var(--s12);
						font-weight: 400;
						margin-top: 2px;
					}
				}
			}
			.right {
				color: var(--gray500);
				display: inline-flex;
				align-items: center;
			}
		}
	}
	.validate {
		&:has(p) {
			margin-top: 8px;
		}
		p {
			font-size: var(--s12);
			font-weight: 400;
			color: var(--gray800);
			visibility: hidden;
			&.error {
				color: var(--red);
				visibility: visible;
			}
			&.success {
				color: var(--green);
				visibility: visible;
			}
		}
	}	
}
</style>