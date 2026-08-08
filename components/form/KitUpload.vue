<template>
	<div class="kit-upload" :class="{ 'kit-upload--fill': fill }">
		<label class="field-title">진단키트 사진</label>
		<div class="card">
			<div
				v-if="!modelValue"
				class="upload-zone"
				@click="openPicker"
			>
				<div class="guide-frame" aria-hidden="true">
					<span class="corner tl" />
					<span class="corner tr" />
					<span class="corner bl" />
					<span class="corner br" />
					<span class="guide-label">세로 촬영 가이드</span>
				</div>
				<div class="upload-content">
					<img src="@/assets/img/ic_upload.svg" alt="">
					<p class="hint">터치하여 사진 촬영</p>
					<p class="sub">
						진단키트 <strong>전체가 프레임 안에</strong> 들어오도록<br>
						<strong>세로로</strong> 촬영해 주세요.
					</p>
				</div>
			</div>
			<template v-else>
				<div class="preview">
					<div class="guide-frame preview-frame" aria-hidden="true">
						<span class="corner tl" />
						<span class="corner tr" />
						<span class="corner bl" />
						<span class="corner br" />
					</div>
					<img :src="modelValue" alt="진단키트 사진">
					<button type="button" class="delete" aria-label="삭제" @click="clearImage">×</button>
				</div>
				<p class="guide-note">
					사진 전체가 보이도록 표시됩니다. 가로로 촬영한 경우 위·아래 여백이 생길 수 있으니,
					키트 결과가 흐리거나 잘려 보이면 세로로 다시 촬영해 주세요.
				</p>
				<button type="button" class="retake" @click="openPicker">다시 촬영하기</button>
			</template>
		</div>
		<p class="guide-tips">
			· 키트 결과선이 선명하게 보이도록 조명을 확인해 주세요.<br>
			· 가로(옆으로) 촬영 시 화면에서 양옆이 잘려 보일 수 있습니다.
		</p>
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
	},
	/** 부모 높이에 맞춰 촬영 영역을 축소 (세로 스크롤 방지) */
	fill: {
		type: Boolean,
		default: false
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
		position: relative;
		width: 100%;
		min-height: 240px;
		border: 1px dashed #3eb4eb;
		border-radius: 2px;
		background: #fff;
		cursor: pointer;
		overflow: hidden;
	}

	.upload-content {
		position: relative;
		z-index: 2;
		min-height: 240px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 24px 16px;

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
			word-break: keep-all;

			strong {
				color: var(--gray700);
				font-weight: 500;
			}
		}
	}

	.guide-frame {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(52%, 160px);
		aspect-ratio: 3 / 4;
		pointer-events: none;
		border: 1px dashed rgba(62, 180, 235, 0.45);
		border-radius: 4px;
		background: rgba(62, 180, 235, 0.04);

		.corner {
			position: absolute;
			width: 14px;
			height: 14px;
			border-color: #3eb4eb;
			border-style: solid;

			&.tl {
				top: -1px;
				left: -1px;
				border-width: 2px 0 0 2px;
			}

			&.tr {
				top: -1px;
				right: -1px;
				border-width: 2px 2px 0 0;
			}

			&.bl {
				bottom: -1px;
				left: -1px;
				border-width: 0 0 2px 2px;
			}

			&.br {
				bottom: -1px;
				right: -1px;
				border-width: 0 2px 2px 0;
			}
		}

		.guide-label {
			position: absolute;
			left: 50%;
			bottom: 8px;
			transform: translateX(-50%);
			font-size: 10px;
			font-weight: 500;
			color: #3eb4eb;
			white-space: nowrap;
			background: rgba(255, 255, 255, 0.9);
			padding: 2px 6px;
			border-radius: 2px;
		}

		&.preview-frame {
			z-index: 2;
			background: transparent;
			border-color: rgba(62, 180, 235, 0.35);

			.corner {
				opacity: 0.85;
			}
		}
	}

	.preview {
		position: relative;
		width: 100%;
		height: 240px;
		border-radius: 2px;
		background: #e9e9ec;
		overflow: hidden;

		img {
			position: relative;
			z-index: 1;
			width: 100%;
			height: 100%;
			object-fit: contain;
			object-position: center;
		}

		.delete {
			position: absolute;
			z-index: 3;
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

	.guide-note {
		margin-top: 10px;
		font-size: var(--s12);
		font-weight: 400;
		color: var(--gray600);
		line-height: 1.5;
		word-break: keep-all;
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

	.guide-tips {
		margin-top: 12px;
		font-size: var(--s12);
		font-weight: 400;
		color: var(--gray500);
		line-height: 1.55;
		word-break: keep-all;
	}

	.hidden-input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		overflow: hidden;
	}
}

@media (max-width: 360px) {
	.kit-upload {
		.upload-zone,
		.upload-content {
			min-height: 220px;
		}

		.preview {
			height: 220px;
		}

		.guide-frame {
			width: min(56%, 140px);
		}
	}
}

.kit-upload--fill {
	height: 100%;
	min-height: 0;
	display: flex;
	flex-direction: column;

	.field-title {
		flex-shrink: 0;
		margin-bottom: 8px;
	}

	.card {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 12px;
		overflow: hidden;
	}

	.upload-zone {
		flex: 1;
		min-height: 120px;
		display: flex;
		flex-direction: column;
	}

	.upload-content {
		flex: 1;
		min-height: 0;
		padding: 12px 10px;
		gap: 6px;
	}

	.preview {
		flex: 1;
		min-height: 100px;
		height: auto;
	}

	.guide-note {
		flex-shrink: 0;
		margin-top: 6px;
		font-size: 11px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.retake {
		flex-shrink: 0;
		margin-top: 6px;
	}

	.guide-tips {
		flex-shrink: 0;
		margin-top: 8px;
		font-size: 11px;
	}

	.guide-frame {
		width: min(48%, 140px);
	}
}
</style>
