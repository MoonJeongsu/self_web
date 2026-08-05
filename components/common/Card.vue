<template>
	<div 
		class="common-card" 
		:class="size"
		:style="`background-color: ${bgColor}`"
	>
		<div class="txt-box">
			<h4 class="title" v-html="title"/>
			<p class="desc" v-if="desc" v-html="desc"/>
		</div>
		<div class="img-box" v-if="img">
			<img :src="img">
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	desc: {
		type: String,
		default: ''
	},
	bgColor: {
		type: String,
		default: ''
	},
	img: {
		type: String,
		default: ''
	},
	size: {
		type: String,
		default: 'md'
	}
})
</script>

<style lang="scss" scoped>
.common-card {
	position: relative;
	&.sm {
		width: calc(50% - 5px);
		min-height: 134px;
		height: auto;
		padding: 20px 12px 44px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: var(--sub);
		margin-top: 0;
		border-radius: 6px;
		.txt-box {
			width: 100%;
			text-align: center;
		}
		.title {
			font-size: var(--s16);
			font-weight: 500;
			color: var(--active);
			line-height: 1.4;
			word-break: keep-all;
		}
		.desc {
			display: inline-flex;
			align-items: center;
			height: 24px;
			border-radius: 6px;
			background-color: var(--gray700);
			color: white;
			padding: 0 7px;
			font-size: var(--s12);
			white-space: nowrap;
			position: absolute;
			bottom: 16px;
			left: 50%;
			transform: translateX(-50%);
		}
		~ .common-card {
			margin-top: 0;
		}
	}
	&.md {
		padding: 23px 18px;
		border-radius: 6px;
		.txt-box {
			padding-right: 76px;
			word-break: keep-all;
			line-height: 1.5;
		}
	}
	&.lg {
		width: 100%;
		background-color: var(--gray30);
		padding: 10px 16px;
		.title {
			font-size: var(--s14);
			font-weight: 500;
			color: var(--gray400);
		}
		.desc {
			font-size: var(--s14);
			font-weight: 400;
			color: var(--gray700);
		}
		~ .common-card {
			margin-top: 8px;
		}
	}
	.title {
		font-size: var(--s18);
		font-weight: 500;
		color: var(--gray800);
		margin-bottom: 4px;
	}
	.desc {
		font-size: var(--s14);
		font-weight: 400;
		color: var(--gray600);
	}
	.img-box {
		position: absolute;
		top: 23px;
		right: 18px;
		img {
			max-width: 62px;
			max-height: 62px;
			object-fit: contain;
		}
	}
	~ .common-card {
		margin-top: 16px;
	}
}

@media (max-width: 360px) {
	.common-card {
		&.sm {
			width: 100%;
			min-height: 120px;
			padding-bottom: 48px;
		}
		&.md {
			padding: 20px 16px;

			.txt-box {
				padding-right: 68px;
			}

			.title {
				font-size: var(--s16);
			}

			.desc {
				font-size: 13px;
			}

			.img-box img {
				max-width: 52px;
				max-height: 52px;
			}
		}
	}
}
</style>