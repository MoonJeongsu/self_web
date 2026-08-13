<template>
	<div 
		class="common-offcanvas offcanvas offcanvas-bottom" 
		tabindex="-1" 
		:id="id" 
		aria-labelledby="offcanvasLabel"
		:backdrop="false"
	>
		<div class="offcanvas-header">
			<div class="top">
				<button @click="onHide" :class="{arrow: isArrow}"/>
			</div>
			<h5 
				class="offcanvas-title" 
				id="offcanvasLabel"
				v-html="title"
			/>
		</div>
		<div class="offcanvas-body">
			<slot/>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	id: {
		type: String,
		default: ''
	},
	isArrow: {
		type: Boolean,
		default: false
	},
	show: {
		type: Boolean,
		default: false
	}
})

const emits = defineEmits([
	'hide'
])

const offcanvasInstance = ref<any>(null);

function onHidden() {
	emits('hide')
}

onMounted(() => {
    const el = document.getElementById(props.id);
    if (el && window.bootstrap) {
        // getOrCreateInstance: offcanvas 인스턴스를 가져오거나 생성합니다.
        offcanvasInstance.value = window.bootstrap.Offcanvas.getOrCreateInstance(el);
		el.addEventListener('hidden.bs.offcanvas', onHidden)
        // 초기 show 값에 따라 offcanvas 표시
        if (props.show) {
            offcanvasInstance.value.show();
        } else {
            offcanvasInstance.value.hide();
        }
    }
});

onBeforeUnmount(() => {
	const el = document.getElementById(props.id);
	el?.removeEventListener('hidden.bs.offcanvas', onHidden)
})

watch(
    () => props.show,
    (newVal) => {
        if (offcanvasInstance.value) {
            if (newVal) {
                offcanvasInstance.value.show();
            } else {
                offcanvasInstance.value.hide();
            }
        }
    }
);

function onHide() {
	emits('hide')
}
</script>

<style lang="scss">
.offcanvas-backdrop.show {
	opacity: 0;
}
.layouts {
	&:has(.app-navigation) {
		.offcanvas {
			bottom: 54px;
		}
	}
}
.common-offcanvas.offcanvas {
	border-top: 0;
	box-shadow: 4px 0px 60px rgba(107,107,107,0.09);
	padding: 0 20px 20px;
	height: unset;
	.offcanvas-header {
		display: flex;
		flex-direction: column;
		padding: 0 0;
		.top {
			height: 54px;
			padding-top: 12px;
			button:not(.arrow) {
				width: 52px;
				height: 4px;
				border-radius: 50px;
				background-color: var(--gray200);
			}
			button.arrow {
				width: 24px;
				height: 24px;
				background-image: url('~/assets/img/ic_arrow.svg');
				background-size: 100%;
			}
		}
		.offcanvas-title {
			font-size: var(--s18);
			font-weight: 500;
			text-align: left;
			display: flex;
			align-items: center;
			justify-content: start;
			width: 100%;
			margin-bottom: 12px;
			span {
				font-size: var(--s14);
				font-weight: 400;
				color: var(--gray600);
				display: inline-block;
				margin-left: 8px;
			}
		}
	}
	.offcanvas-body {
		padding: 0 0;
	}
	.common-button {
		margin-top: 24px;
	}
}
</style>