# Front

Admasker의 **브랜드 × 크리에이터 매칭 서비스** 프론트엔드입니다. React + TypeScript + Vite로 작성했고, API와 영상 AI는 별도 저장소로 분리했습니다.

- [Back](https://github.com/Admasker/Back): 회원·프로필·캠페인·지원/선정·영상 프로젝트 API
- [Aicore](https://github.com/Admasker/Aicore): 비공개 영상 AI 재생성 서버

## 화면

| 경로 | 기능 |
|---|---|
| `/` | 브랜드·크리에이터용 랜딩, 캠페인 소개, PPL 스튜디오 안내 |
| `/campaigns` | 검색·카테고리·플랫폼 필터, 상세, 광고주 캠페인 등록, 크리에이터 지원 |
| `/creators` | 공개 프로필 탐색과 채널 링크 |
| `/workspace` | 광고주: 캠페인/지원자 관리와 선정, 크리에이터: 프로필과 지원 상태 |
| `/studio` | 영상·제품 배치 시안, 업로드·프로젝트 저장, 별도 AI 작업·결과 UI |

회원가입에서 광고주 또는 크리에이터 역할을 선택합니다. 로그인은 일반 이메일·비밀번호 방식입니다. UI의 샘플 캠페인·브랜드와 콘셉트 사진은 **예시**로 구분하고 실제 모집·협업·성과로 표시하지 않습니다.

## 실행

Node.js 22.13 이상을 사용합니다.

```sh
npm ci
cp .env.example .env
npm run dev
```

개발 주소는 `http://127.0.0.1:5173`입니다. `/api`를 기본 `http://127.0.0.1:4000`으로 프록시합니다. API 서버는 Back 저장소에서 실행하세요.

```dotenv
API_PROXY_TARGET=http://127.0.0.1:4000
```

`API_PROXY_TARGET`은 개발 서버 전용입니다. 브라우저 코드에 비밀 토큰을 넣지 않습니다. 운영에서는 같은 오리진의 `/api`를 Back으로 역방향 프록시하세요. 인증은 백엔드가 발급하는 HttpOnly 세션 쿠키를 사용합니다.

백엔드가 없으면 랜딩·예시 캠페인·제품 배치 시안을 사용할 수 있지만, 실제 가입·캠페인 등록·지원·저장 기능은 API 연결이 필요합니다. 연결 실패는 화면에 표시합니다.

## 빌드

```sh
npm run check
npm run build
npm run preview
```

산출물은 `dist/`입니다. 정적 호스팅에서 SPA 경로가 `index.html`로 연결되게 설정하세요.

## Docker

```sh
docker build -t admasker-front .
docker run --rm -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=http://host.docker.internal:4000 \
  admasker-front
```

별도 서버나 컨테이너를 사용할 경우 `API_UPSTREAM`을 변경하세요. API가 허용하는 프론트 origin과 HTTPS 쿠키 설정도 실제 도메인에 맞춰야 합니다. 작성 환경에 Docker가 없어 컨테이너 실행은 검증하지 않았습니다.

## 구조와 API 계약

```text
src/
  components/Landing.tsx      검색 중심의 서비스 랜딩
  components/Marketplace.tsx  캠페인·프로필·계정·워크스페이스
  components/Studio.tsx       영상 PPL 배치·작업 UI
  components/Brand.tsx        Admasker 브랜드
  lib/api.ts                 모든 HTTP 호출
  shared/types.ts            API 응답 타입과 배치값
  styles.css                 기본·스튜디오 스타일
  marketplace.css            매칭 서비스 스타일
  landing.css                랜딩 전용 밝은 테마
  main.tsx                   경로 진입점
public/                      이미지·폰트
```

API 인터페이스는 `src/lib/api.ts`, 타입은 `src/shared/types.ts`, 서버 측 계약은 Back의 README에서 확인할 수 있습니다. Front는 Aicore에 직접 요청하거나 GPU 비밀 토큰을 보유하지 않습니다.

## 현재 범위

- 매칭은 분야·플랫폼 탐색 → 지원 → 광고주 검토·선정 방식입니다. 자동 추천 모델·계약·결제·메시징은 포함하지 않습니다.
- 영상 PPL의 핵심 방향은 원본 스토리와 화면을 지키고 제품 주변만 재생성하는 것입니다. 배치 시안과 AI 결과는 별도로 표시하며, GPU 미연결 시 재생성을 활성화하지 않습니다.
- 실제 GPU 추론 및 제품·로고의 자연스러운 재현 품질은 아직 검증하지 않았습니다.

## 검증 및 에셋

독립 체크아웃 타입 검사·Vite 빌드, 브랜드 가입→캠페인 등록→크리에이터 가입/프로필→지원→광고주 선정→크리에이터 결과 확인을 브라우저에서 검증합니다. 데스크톱과 모바일 경로도 확인합니다.

사진은 Unsplash의 공간/모델 콘셉트 이미지입니다. morrow, STILL STUDIO, PLOT은 서비스 예시용 가상 브랜드·캠페인이며 실제 광고주나 협업을 의미하지 않습니다. Pretendard 폰트의 SIL Open Font License는 `public/fonts/OFL.txt`에 포함했습니다.

## 랜딩 디자인 참고

[Collabstr](https://collabstr.com/)의 검색·플랫폼 선택과 [리뷰노트](https://www.reviewnote.co.kr/)의 캠페인 탐색 구성을 참고해, Admasker 브랜드에 맞게 새로 구성했습니다. 적용 범위와 데이터 표시는 [랜딩 참고 기록](docs/landing-references.md)에 정리했습니다.

첫 화면에서 광고주/크리에이터 역할을 선택하고 플랫폼·키워드로 검색할 수 있습니다. 검색어·플랫폼·카테고리는 목록 URL에 전달되어 초기 필터에 반영됩니다. 예시 프로필과 실제 API 프로필은 사진·표시를 구분하고, API 미연결 상태도 숨기지 않습니다.
