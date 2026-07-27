/** data URL(base64) → File (진단키트 multipart 업로드용) */
export function dataUrlToFile(dataUrl: string, filename = 'kit.jpg'): File {
	const [header, base64] = dataUrl.split(',')
	if (!base64) {
		throw new Error('유효하지 않은 이미지 데이터입니다.')
	}
	const mime = header?.match(/:(.*?);/)?.[1] || 'image/jpeg'
	const binary = atob(base64)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i)
	}
	const ext = mime.includes('png') ? 'png' : 'jpg'
	return new File([bytes], filename.includes('.') ? filename : `kit.${ext}`, { type: mime })
}
