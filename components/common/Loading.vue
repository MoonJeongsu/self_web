<template>
	<Container
		:title="title"
		:desc="desc"
		class="common-loading"
	>
		<div class="content">
			<div class="loader"></div>
		</div>
	</Container>
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
	}
})
</script>

<style lang="scss" scoped>
@keyframes rotation {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
} 
.common-loading {
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	background-color: white;
	padding-top: 48px;
	.content {
		display: flex;
		width: 100%;
		height: calc(100% - 122px);
		align-items: center;
		justify-content: center;
	}
}

.loader {
    width: 84px;
    height: 84px;
    border: 10px solid #ECF8FE;
    border-bottom-color: var(--active);
	border-radius: 30px;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
</style>