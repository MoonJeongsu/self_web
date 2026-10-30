# [프론트] 회원가입 — 근무지/근무형태 선택값 및 API 스펙

백엔드 연동·검증용 문서입니다.  
self-web 회원가입 화면에서 기관(근무지)·근무형태 선택 시 서버로 전송하는 형식을 정리합니다.

---

## 1. API

| 항목 | 내용 |
|------|------|
| Method | `POST` |
| Path | `/v1/user/signup` |
| Content-Type | `application/json` |

---

## 2. 요청 Body (기관/근무 관련 필드)

| 필드명 | 타입 | 필수 | 설명 | 전송 예시 |
|--------|------|------|------|-----------|
| `workplace` | string | Y | 근무지(기관) 선택값 | `"KETI"` |
| `workType` | string | Y | 근무형태 선택값 | `"사무직"` |
| `address` | string | - | 현재 프론트는 `workplace`와 **동일 값**을 넣어 전송 | `"KETI"` |
| `addressDetail` | string | - | 현재 프론트는 `workType`와 **동일 값**을 넣어 전송 | `"사무직"` |

> **참고:** `address` / `addressDetail`은 근무지·근무형태를 재매핑한 값입니다.  
> 서버에서 주소 필드로 쓰는지, `workplace` / `workType`만 쓰는지 확인이 필요합니다.

---

## 3. 회원가입 전체 Body 예시

```json
{
  "loginId": "testuser01",
  "password": "********",
  "name": "홍길동",
  "birthDate": "19900101",
  "gender": "M",
  "workplace": "KETI",
  "workType": "사무직",
  "address": "KETI",
  "addressDetail": "사무직"
}
```

- `gender`: `"M"` \| `"F"`
- `birthDate`: `YYYYMMDD` (하이픈 없음)

---

## 4. `workplace` (근무지/기관) 허용 값

화면 표시명과 서버 전송값이 **동일**합니다. (코드성 ID 아님)

화면 순서는 한글 가나다 → 영문 ABC이며 `(주)거화`는 거화로 정렬하고 `기타`는 맨 끝이다.

| No | 전송값 |
|----|--------|
| 1 | `가톨릭대` |
| 2 | `(주)거화` |
| 3 | `노원구 시설관리공단` |
| 4 | `대덕HTS(주)` |
| 5 | `대한산업보건협회 부산지역본부` |
| 6 | `디토닉` |
| 7 | `삼영기업` |
| 8 | `서밋` |
| 9 | `세종대` |
| 10 | `순천향대` |
| 11 | `어빌리티` |
| 12 | `엔투엠` |
| 13 | `한국동서발전(주) 울산발전본부` |
| 14 | `한국철도공사_수도권동부본부` |
| 15 | `한보총` |
| 16 | `한신대` |
| 17 | `현대케피코` |
| 18 | `CJ헬로비전` |
| 19 | `GFID` |
| 20 | `KETI` |
| 21 | `기타` |

---

## 5. `workType` (근무형태) 허용 값

화면 표시명과 서버 전송값이 **동일**합니다.

| No | 전송값 |
|----|--------|
| 1 | `사무직` |
| 2 | `연구직` |
| 3 | `서비스직` |
| 4 | `영업/마케팅직` |
| 5 | `생산/기술직` |

---

## 6. 프론트 구현 위치

| 구분 | 경로 |
|------|------|
| 옵션 목록 | `utils/options.ts` (`workplaces`, `workTypes`) |
| 요청 타입 | `types/index.ts` → `SignupRequestType` |
| API 호출 | `composables/api/main.ts` → `mainApi.signup()` |
| 화면 | `pages/signup.vue` |

---

## 7. 백엔드 확인 요청

1. `workplace` / `workType`를 위 문자열 그대로 저장·검증하는지
2. `address` / `addressDetail` 중복 전송을 서버에서 어떻게 처리하는지
3. 허용 값 목록이 서버 enum/코드와 일치하는지 (불일치 시 목록 회신 요청)
