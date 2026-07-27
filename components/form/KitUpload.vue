<template>
	<div class="kit-upload">
		<label class="field-title">진단키트 사진</label>
		<div class="card">
			<div
				v-if="!modelValue"
				class="upload-zone"
				@click="openPicker"
			>
				<img src="@/assets/img/ic_upload.svg" alt="">
				<p class="hint">터치하여 사진 촬영</p>
				<p class="sub">진단키트 결과가 선명하게 보이도록<br>촬영해 주세요.</p>
			</div>
			<template v-else>
				<div class="preview">
					<img :src="modelValue" alt="진단키트 사진">
					<button type="button" class="delete" aria-label="삭제" @click="clearImage">×</button>
				</div>
				<button type="button" class="retake" @click="openPicker">다시 촬영하기</button>
			</template>
		</div>
		<input
			ref="fileInputRef"
			type="file"
			accept="image/*"
			capture="environment"
			class="hidden-input"
			@change="onFileChange"
		>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	modelValue: {
		type: String,
		default: ''
	}
})

const emits = defineEmits(['update:modelValue'])

const fileInputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
	fileInputRef.value?.click()
}

function clearImage() {
	emits('update:modelValue', '')
	if (fileInputRef.value) {
		fileInputRef.value.value = ''
	}
}

function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return

	if (!file.type.startsWith('image/')) {
		return
	}

	const reader = new FileReader()
	reader.onload = () => {
		emits('update:modelValue', reader.result as string)
	}
	reader.readAsDataURL(file)
}
</script>

<style lang="scss" scoped>
.kit-upload {
	width: 100%;
	.field-title {
		font-size: var(--s14);
		font-weight: 500;
		margin-bottom: 12px;
		display: block;
		color: var(--gray800);
	}
	.card {
		background-color: var(--gray30);
		border-radius: 2px;
		padding: 20px;
	}
	.upload-zone {
		width: 100%;
		min-height: 180px;
		border: 1px dashed #3eb4eb;
		border-radius: 2px;
		background: #fff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		cursor: pointer;
		img {
			width: 24px;
			height: 24px;
		}
		.hint {
			font-size: var(--s14);
			font-weight: 500;
			color: #3eb4eb;
		}
		.sub {
			font-size: var(--s12);
			font-weight: 400;
			color: var(--gray500);
			text-align: center;
			line-height: 1.5;
		}
	}
	.preview {
		width: 100%;
		height: 180px;
		border-radius: 2px;
		background: #e9e9ec;
		position: relative;
		overflow: hidden;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		.delete {
			position: absolute;
			top: 8px;
			right: 8px;
			width: 24px;
			height: 24px;
			border-radius: 24px;
			border: none;
			background: rgba(27, 27, 28, 0.6);
			color: #fff;
			font-size: 14px;
			line-height: 1;
			cursor: pointer;
		}
	}
	.retake {
		margin-top: 10px;
		border: none;
		background: transparent;
		font-size: var(--s14);
		font-weight: 500;
		color: #3eb4eb;
		cursor: pointer;
		padding: 0;
	}
	.hidden-input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		overflow: hidden;
	}
}
</style>
