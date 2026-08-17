<template>
	<Container
		pageTitle="마이페이지"
		class="setting"
		noPadding
	>
		<div class="box">
			<h6 class="title">주 사용자</h6>
			<div class="profile">
				<div class="img-box">
					<img :src="user.gender === 'woman' ? iconWoman : iconMan">
				</div>
				<div class="txt-box">
					<b>{{ user.name }}</b>
					<p v-if="profileWorkplace">{{ profileWorkplace }}</p>
					<p v-if="profileWorkType">{{ profileWorkType }}</p>
					<p>{{ user.birthDate }}</p>
				</div>
			</div>
			<h6 class="title">동거인</h6>
			<CommonButton
				color="outline-black"
				text="동거인 추가"
				:icon="iconPlus"
				@click="isShowConfirmAddMember = true"
				:disabled="members.length > 5"
			/>
			<CommonList
				:list="members"
				noContentTxt="등록된 동거인이 없습니다.<br>상단 버튼을 터치하여 등록해 주세요."
			/>
		</div>
		<div class="box">
			<h6 class="title">알림설정</h6>
			<CommonList
				:list="[{ title: '진단 알림<span>매일 12시 진단 권유 알림을 보내드립니다.</span>' }]"
			>
				<FormSwitch v-model="isNotice" />
			</CommonList>
		</div>
		<div class="box">
			<h6 class="title">도움</h6>
			<CommonList
				:list="[
					{ title: '공지사항', key: 'notice' },
					{ title: '앱 이용 안내', key: 'guide' },
					{ title: 'FAQ', key: 'faq' }
				]"
				@click="goPage"
			/>
		</div>
		<div class="box">
			<h6 class="title">계정</h6>
			<CommonList
				:list="account"
				@click="showLogout"
			/>
		</div>
		<p v-if="appVersion" class="app-version">앱 버전 {{ appVersion }}</p>
		<!--동거인 등록 여부 확인 모달-->
		<Modal
			title="동거인을 등록할까요?"
			desc="함께 거주하는 분을 등록하여<br>기기 하나로 각자 진단이 가능합니다.<br><br>동거인 등록 시 근무지 보건관리자에게 사전 확인 요망"
			cancelBtnTxt="다음에 할게요"
			submitBtnTxt="등록하기"
			:show="isShowConfirmAddMember"
			@cancel="isShowConfirmAddMember = false"
			@submit="goMemberRegister"
		/>
		<ModalOffcanvas
			:title="`동거인 등록<span>${members.length}명 이용중</span>`"
			isBottom
			id="add-member"
			:show="isShowAddMember"
			@hide="isShowAddMember = false"
		>
			<div class="notice-box">동거인 등록 시 근무지 보건관리자에게 사전 확인 요망</div>
			<div class="forms">
				<FormInput
					title="성명"
					v-model="forms.name"
					placeholder="예) 홍길동"
				/>
				<FormInput
					title="생년월일"
					v-model="forms.birthDate"
					placeholder="예) 20000101"
				/>
				<CommonList
					type="radio"
					title="성별"
					:list="state.genders"
					:active="forms.gender"
					@click="(key: string) => forms.gender = key"
				/>
				<CommonList
					type="radio"
					:list="options.inoculations"
					:active="forms.isVaccinated"
					@click="onSelectMemberVaccination"
				/>
				<div v-if="forms.isVaccinated === true" class="field-textarea">
					<label class="field-title">백신접종 정보 입력</label>
					<textarea
						v-model="forms.vaccinatedDate"
						placeholder="예시) 인플루엔자 백신 3가, 4가 2025.11.1 접종&#10;예시)RSV 백신 2026.08.01 접종"
					/>
					<div class="validate">
						<p :class="memberVaccinatedDateValidation.status">
							{{ memberVaccinatedDateValidation.text }}
						</p>
					</div>
				</div>
				<CommonButton
					text="등록"
					@click="addMember"
				/>
			</div>
		</ModalOffcanvas>
		<Modal
			title="로그아웃 하시나요?"
			desc="현재 계정에서 로그아웃합니다."
			cancelBtnTxt="취소"
			submitBtnTxt="로그아웃"
			:show="isShowModalLogout"
			@cancel="hideModalLogout"
			@submit="logout"
		/>
	</Container>
</template>

<script setup lang="ts">
import { memberApi } from '~/composables/api/member'
import {noticeApi} from '~/composables/api/notice'
definePageMeta({
	layout: 'page',
})

import iconPlus from '@/assets/img/ic_plus.svg'
import iconWoman from '@/assets/img/ic_woman.svg'
import iconMan from '@/assets/img/ic_man.svg'
import { mainApi } from '~/composables/api/main'
import options from '~/utils/options'
import type { ProfileUserType } from '~/types'
import {
	formatBirthDate,
	isPrimaryUserMember,
	mergeProfileWithOwner,
	normalizeMember,
	normalizeProfileUser,
} from '~/utils/profile'
import { getAppVersion } from '~/utils/nativeBridge'

const toast = useAppToast()
const appVersion = ref('')

const state = ref({
	genders: [
		{ title: '남', key: 'M' },
		{ title: '여', key: 'F' }
	]
})

// 프로필
const user = ref<ProfileUserType>({
	name: '',
	gender: '',
	birthDate: '',
	workplace: '',
	workType: '',
	alarm: 'Y',
})

const profileWorkplace = computed(() => user.value.workplace?.trim() || '')
const profileWorkType = computed(() => user.value.workType?.trim() || '')
//계정 리스트
const account = ref([
	{
		title: '로그아웃',
		desc: '',
		key: 'logout'
	}
])

// 거주 구성원
const members = ref([])
//동거인 등록 여부 확인 모달
const isShowConfirmAddMember = ref(false)
//구성원 추가 모달
const isShowAddMember = ref(false);

function goMemberRegister() {
	isShowConfirmAddMember.value = false
	isShowAddMember.value = true
}

// 알림 설정
const isNotice = ref(true)

// forms
const forms = ref({
	name: '',
	birthDate: '',
	gender: '',
	isVaccinated: true,
	vaccinatedDate: '',
})
const memberVaccinatedDateValidation = ref({ status: '', text: '접종 정보를 입력해주세요.' })

// 모달 : 로그아웃
const isShowModalLogout = ref(false)

onMounted(async () => {
	appVersion.value = getAppVersion()
	await getProfile()
	await getMembers()
})

watch(() => isNotice.value, (val) => {
	changeAlarm()
})

function showLogout(): void {
	isShowModalLogout.value = true;
}
function hideModalLogout(): void {
	isShowModalLogout.value = false;
}

// 도움 내 클릭 이벤트 - 페이지 이동
function goPage(type: string): void {
	if (type === 'guide') {
		navigateTo('/guide');
		return;
	}
	if (type === 'notice' || type === 'faq') {
		toast.add({ title: '준비 중입니다.' });
	}
}

//프로필 조회
async function getProfile() {
	const profile = await mainApi.getProfile()

	if (profile) {
		const normalized = normalizeProfileUser(profile)
		const cached = useCookie<ProfileUserType>('userInfo').value

		if (cached) {
			const cachedProfile = normalizeProfileUser(cached)
			if (!normalized.name || /^\d{8}$/.test(normalized.name)) {
				normalized.name = cachedProfile.name || normalized.name
			}
			if (!normalized.id && cachedProfile.id) {
				normalized.id = cachedProfile.id
			}
		}

		user.value = normalized
		isNotice.value = user.value.alarm === 'Y'
		account.value = [
			{
				title: '로그아웃',
				desc: user.value?.login_id,
				key: 'logout'
			}
		]
	}
}

//동거인 조회
async function getMembers() {
	const res = await memberApi.getMembers();
	if (res?.list) {
		const list = res.list.map(el => normalizeMember(el))
		const owner = list[0]

		if (owner) {
			user.value = mergeProfileWithOwner(user.value, owner)
		}

		members.value = list
			.filter(el => !isPrimaryUserMember(el, user.value))
			.map(el => {
				el.title = el.name;
				el.desc = formatBirthDate(el.birthDate);
				el.img = el.gender === 'M' ? iconMan : iconWoman;
				return el;
			});
	}
}

// 동거인 등록: addMember 함수
function onSelectMemberVaccination(key: boolean) {
	forms.value.isVaccinated = key
	if (!key) {
		forms.value.vaccinatedDate = ''
		memberVaccinatedDateValidation.value.status = ''
	}
}

function validateMemberForms(): boolean {
	if (!forms.value.name || forms.value.birthDate.length !== 8 || !forms.value.gender) {
		toast.add({ title: '성명, 생년월일, 성별을 입력해주세요.' })
		return false
	}
	if (forms.value.isVaccinated === true && !forms.value.vaccinatedDate?.trim()) {
		memberVaccinatedDateValidation.value.status = 'error'
		return false
	}
	memberVaccinatedDateValidation.value.status = ''
	return true
}

async function addMember() {
	if (!validateMemberForms()) return
	const res = await memberApi.addMembers(forms.value);
	if(res) {
		await getMembers();
		forms.value = {
			name: '',
			birthDate: '',
			gender: '',
			isVaccinated: true,
			vaccinatedDate: '',
		};
		memberVaccinatedDateValidation.value.status = ''
		isShowAddMember.value = false;
	}
}

//알람 설정
async function changeAlarm() {
	const alarm = isNotice.value === true ? 'Y' : 'N'
	const res = await noticeApi.changeAlarm(alarm)
}

//로그아웃
async function logout() {
	// 쿠키 초기화
	const accessToken = useCookie('accessToken')
	const userInfo = useCookie('userInfo')

	accessToken.value = null
	userInfo.value = null

	localStorage.setItem('accessToken', '')

	// 페이지 이동
	await navigateTo('/login')
}
</script>

<style lang="scss" scoped>
    .setting {
        h6.title {
            font-size: var(--s16);
            font-weight: 500;
            color: var(--gray700);
            margin-bottom: 12px;
        }
        .profile {
            width: 100%;
            border: 1px solid var(--gray100);
            border-radius: 2px;
            padding: 16px;
            display: flex;
            margin-bottom: 16px;
            .img-box {
                min-width: 64px;
                height: 64px;
                background-color: var(--sub);
                border-radius: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    width: 36px;
                }
            }
            .txt-box {
                margin-left: 15px;
                b {
                    font-size: var(--s14);
                    font-weight: 500;
                    color: var(--gray700);
                }
                p {
                    font-size: var(--s14);
                    font-weight: 400;
                    color: var(--gray600);
                }
            }
        }
        .box {
            background-color: white;
            position: relative;
            padding: 20px;
            ~ .box {
                margin-top: 8px;
            }
            .common-list {
                margin-top: 15px;
            }
        }
        .app-version {
            margin: 16px 20px 24px;
            text-align: center;
            font-size: var(--s12);
            font-weight: 400;
            color: var(--gray500);
        }
        .notice-box {
            background-color: #ECF7FD;
            color: #3EB4EB;
            font-size: var(--s14);
            font-weight: 500;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        .field-hint {
            font-size: var(--s12);
            font-weight: 400;
            color: var(--gray600);
            margin-top: -8px;
            margin-bottom: 16px;
        }
        .field-textarea {
            margin-top: 15px;
            .field-title {
                font-size: var(--s14);
                font-weight: 500;
                margin-bottom: 8px;
                display: block;
            }
            textarea {
                width: 100%;
                min-height: 80px;
                border: 1px solid var(--gray100);
                padding: 16px;
                font-size: var(--s14);
                font-family: inherit;
                resize: vertical;
                background-color: #fff;
                color: var(--gray800);
                color-scheme: light;
                &::placeholder {
                    color: var(--gray400);
                    line-height: 1.5;
                }
                &:focus {
                    outline: none;
                }
            }
            .validate p {
                font-size: var(--s12);
                color: var(--red);
                margin-top: 8px;
                visibility: hidden;
                &.error {
                    visibility: visible;
                }
            }
        }
    }
</style>
