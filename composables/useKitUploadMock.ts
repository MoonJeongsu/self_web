export interface KitUploadRecord {
	id: string
	memberId: string
	memberName: string
	testDate: string
	kitNumber: string
	kitImage: string
	uploadedAt: string
	testResult?: string
	symptoms?: string
}

const DB_NAME = 'self_kit_mock'
const DB_VERSION = 1
const STORE = 'uploads'

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (!import.meta.client) {
			reject(new Error('IndexedDB is client-only'))
			return
		}
		const req = indexedDB.open(DB_NAME, DB_VERSION)
		req.onerror = () => reject(req.error)
		req.onsuccess = () => resolve(req.result)
		req.onupgradeneeded = () => {
			const db = req.result
			if (!db.objectStoreNames.contains(STORE)) {
				const store = db.createObjectStore(STORE, { keyPath: 'id' })
				store.createIndex('memberId', 'memberId', { unique: false })
				store.createIndex('testDate', 'testDate', { unique: false })
			}
		}
	})
}

function nextKitNumber(existing: KitUploadRecord[]) {
	const year = new Date().getFullYear()
	const prefix = `KIT-${year}-`
	const nums = existing
		.map(r => r.kitNumber)
		.filter(n => n.startsWith(prefix))
		.map(n => parseInt(n.slice(prefix.length), 10))
		.filter(n => !Number.isNaN(n))
	const next = (nums.length ? Math.max(...nums) : 0) + 1
	return `${prefix}${String(next).padStart(4, '0')}`
}

export function useKitUploadMock() {
	async function listAll(): Promise<KitUploadRecord[]> {
		const db = await openDb()
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, 'readonly')
			const req = tx.objectStore(STORE).getAll()
			req.onsuccess = () => resolve(req.result ?? [])
			req.onerror = () => reject(req.error)
		})
	}

	async function saveKitUpload(input: {
		memberId: string
		memberName: string
		kitImage: string
		testDate: string
		testResult?: string
		symptoms?: string
	}): Promise<KitUploadRecord> {
		const all = await listAll()
		const id = `${input.memberId}_${input.testDate}`
		const existing = all.find(r => r.id === id)
		const kitNumber = existing?.kitNumber ?? nextKitNumber(all)
		const record: KitUploadRecord = {
			id,
			memberId: input.memberId,
			memberName: input.memberName,
			testDate: input.testDate,
			kitNumber,
			kitImage: input.kitImage,
			uploadedAt: new Date().toISOString(),
			testResult: input.testResult,
			symptoms: input.symptoms,
		}

		const db = await openDb()
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, 'readwrite')
			const req = tx.objectStore(STORE).put(record)
			req.onsuccess = () => resolve(record)
			req.onerror = () => reject(req.error)
		})
	}

	async function getByMember(memberId: string): Promise<KitUploadRecord[]> {
		const all = await listAll()
		return all.filter(r => r.memberId === memberId)
	}

	return { saveKitUpload, listAll, getByMember }
}
