# 안전보건 법규 컴플라이언스 대시보드

_Started 2026-06-30 01:30 UTC_

---

## User

# Claude Design 프롬프트 — 안전보건 법규 컴플라이언스 대시보드

## 1) 만들 것 (개요)

한화솔루션 **SHE Portal** 내에 추가될, **산업안전보건 법규 준수 통합관리 대시보드** 웹 화면을 디자인·구현해줘. 기존 SHE Portal과 시각적으로 자연스럽게 어우러져야 하며(아래 디자인 원칙 참고), 사업장은 **울산공장** 기준이야.

세 개의 화면으로 구성돼:

- **① 메인 대시보드** — 사업장 전체 법규 준수 현황 요약 조망
- **② 법정 안전교육 이수관리 탭** — 안전보건관리책임자 등 법정교육(신규·보수) 일정·이수 관리
- **③ 사업장 법규충족 대시보드 탭** — 해당 법규별 준수현황 + 개정 조항·시행일자·자사 대응현황 관리

---

## 2) 누가, 어떤 화면에서 주로 작업하는가 (사용자 × 화면 매핑)

이 매핑을 화면별 정보 우선순위와 기본 진입 동선 설계에 반영해줘.

| 사용자 | 주 사용 화면 | 그 화면에서 하는 핵심 작업 |
|---|---|---|
| **안전보건팀 담당자**(주 사용자) | ③ 법규충족 대시보드 (작업의 중심), ② 교육 이수관리 | 해당 법규 등록·해당여부 토글, 준수상태/근거 입력, 개정 조항·시행일자·대응현황 기록, 교육 대상자·이수 입력 |
| **안전보건팀장** | ① 메인 대시보드 | 전체 준수율·임박 일정·미흡 항목을 모니터링하고 우선순위 판단 (주로 조회·점검) |
| **안전보건관리책임자** | ② 교육 이수관리 | 본인 법정교육(신규/보수) 도래 일정·이수 상태 확인 |
| **경영진/임원** | ① 메인 대시보드 | 사업장 전체 준수율·리스크 요약을 한눈에 확인 (조회 전용 성격) |

설계 시사점:

- **담당자**는 입력·편집이 잦으므로 ③/② 화면은 **표 기반 + 행 클릭 시 우측 상세/편집 패널** 구조로, 입력 효율을 우선해줘.
- **팀장·경영진**은 ① 화면을 조회 중심으로 쓰므로, 메인 대시보드는 **요약 카드·차트·임박 리스트** 위주의 "읽기 좋은" 레이아웃으로.
- 진입 직후 기본 화면은 **① 메인 대시보드**.

---

## 3) 디자인 원칙 (첨부 SHE Portal 화면 참고)

첨부한 SHE Portal 스크린샷의 톤앤매너를 따라줘. 핵심 원칙은 다음과 같아:

### 3-1. 컬러 / 톤

- **다크 좌측 사이드바 + 다크 상단 헤더**(짙은 브라운·차콜 계열, 약 `#2B2422`~`#1F1A18` 톤). 본문 콘텐츠 영역은 밝은 회백색 배경.
- **포인트 컬러는 오렌지**(약 `#F39200`/`#FF8A00` 계열) — 활성 탭 밑줄, 선택 상태, 강조 버튼, 차트 막대(달성)에 사용.
- 보조/대비 컬러는 **딥 네이비**(약 `#1F3864`) — 차트 막대(목표), 표 헤더, 데이터 강조에 사용.
- 상태 표시는 색 배지로: **준수/이수완료=그린**, **진행중/예정=오렌지**, **미흡/지연=레드**.

### 3-2. 레이아웃

- **좌측 GNB(다크) + 상단 글로벌 헤더(로고·대메뉴·사용자정보) + 본문** 3분할 고정 구조. 본문 상단에는 첨부 화면처럼 **우측 정렬 "사업장 선택" 드롭다운(울산공장)**을 배치.
- 본문은 **2-컬럼 카드 그리드**(좌/우 위젯 배치)를 기본으로. 첨부의 "공지사항 / 무재해 현황" 카드 배치처럼, 각 위젯은 **흰 카드 + 옅은 테두리 + 상단에 제목과 우측 `+more` 링크** 형태로.
- 카드 모서리는 **거의 직각에 가까운 약한 라운드**, 그림자는 최소화한 **플랫·정돈된** 느낌.

### 3-3. 데이터 표현

- 차트는 첨부와 동일하게 **막대 그래프**(달성=오렌지, 목표=네이비) 스타일을 재사용해 일관성 유지. 준수율 요약에 활용.
- 표는 첨부의 무재해 현황 표처럼 **헤더 강조 + 넉넉한 행 높이 + 구분선 위주의 가벼운 표**. 과한 음영 없이 가독성 우선.

### 3-4. 타이포 / 밀도

- 한글 본문 폰트(맑은 고딕/Noto Sans KR 계열), **정보 밀도는 중간**(첨부처럼 여백을 살려 답답하지 않게).
- 한국어 UI, 날짜는 `YYYY-MM-DD`, 임박 항목은 **D-day 배지**로 표기.

---

## 4) 화면별 구성 요소

### ① 메인 대시보드

상단 요약 카드(해당 법규 총건수 / 준수 / 진행중 / 미흡, 전체 준수율 %) → 좌측 "법정교육 임박(D-30 이내)" 리스트 위젯 + 우측 "개정 알림(시행일 D-day)" 위젯 → 하단 "대응 필요 Top N" 리스트 + 준수율 추이 막대/라인 차트.

### ② 법정 안전교육 이수관리 탭

상단 캘린더/타임라인(교육 도래 일정) → 교육 대상자 표. 표 컬럼: 대상자, 직책(예: 안전보건관리책임자), 교육명, 교육종류(신규/보수), 주기, 직전 이수일, 차기 도래일, **D-day**, 상태 배지, 증빙. 행 클릭 시 우측 상세·이수처리 패널.

### ③ 사업장 법규충족 대시보드 탭

좌측 법규 트리(법률→시행령→시행규칙→조항) + 필터 → 해당 법규 표. 표 컬럼: 법령명, 구분(법/령/규칙), 조항, 적용요건(해당사유), 해당여부 토글, 준수상태 배지, 준수근거(매뉴얼/증빙 링크), 개정여부, **시행일자(D-day)**, 대응현황, 담당자, 최종갱신일. 행 클릭 시 우측 상세 패널(조항 상세·근거문서·이력·대응 메모·개정 전후 비교).

---

## 5) 산출물 요청

- 위 3개 화면을 **반응형 웹 대시보드**(데스크톱 우선)로 구현.
- 실제 데이터는 없으니 **현실감 있는 더미 데이터**(산업안전보건법·중대재해처벌법·위험물안전관리법 조항 예시, 안전보건관리책임자 교육 일정 등)로 채워줘.
- 탭/사이드바 네비게이션으로 세 화면을 전환할 수 있게 하고, 첨부 SHE Portal과 **이질감 없는 동일 디자인 언어**를 유지해줘.

## Assistant

_[tool: list_files]_

The spec is impressively detailed — colors, layout, users, and screen composition are all specified. Before I build, a few focused questions (the referenced SHE Portal screenshots didn't come through, so the first one matters most).

_[tool: questions_v2]_

## User

Questions answered:
- screenshots: uploads/screenshots-1782783159112.png
- build_mode: 인터랙티브 프로토타입 — 탭 전환·행 클릭 상세패널·토글·이수처리 등 실제 동작
- variations: ③ 법규충족 화면(표+상세패널) 구조 2~3안
- logo: 직접 업로드할게요 (이미지 첨부 예정)
- chart_focus: 대응 필요·미흡 항목 리스트 (리스크 우선)

## Assistant

I'll look at the screenshot to ground the design language.

_[tool: view_image]_

Got the reference. The design language is clear: white global header with orange-underlined active tab, dark charcoal-brown left GNB with orange active item, light body with white bordered cards (title + `+more`), orange/navy bar charts, status color badges. Let me set up my plan and build.

_[tool: update_todos]_

Building the reusable law-detail panel first (used by all three variants of screen ③).

_[tool: dc_write]_

Now the main dashboard DC — shell, three screens, data, and interactions. This is the large one.

_[tool: dc_write]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: eval_js]_

It rendered after mount. Let me capture all three screens.

_[tool: multi_screenshot]_

Main dashboard matches the reference well. My nav-click selector missed (labels are in spans). Let me drive navigation properly and check screens ② and ③.

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

Navigation works — clicking the leaf span. The earlier helper clicked an ancestor. Now on ②; let me capture it and the three ③ variants.

_[tool: multi_screenshot]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Screenshot capture ignores scroll position, but DOM checks confirm rendering. Let me verify screen ③ and the LawDetail child mount across variants via DOM.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

3a drawer mounts the LawDetail child fully. Let me capture screen ③ and test the 3b/3c variants.

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: save_screenshot]_

Screenshot tool is flaky right now, but eval_js works. Let me confirm variants 3b and 3c render correctly via DOM, then hand off to the verifier.

_[tool: eval_js]_

_[tool: eval_js]_

All three ③ variants work (drawer, dock, inline-expand). Let me confirm the trend chart bars render and the edu "이수 처리" mutation works.

_[tool: eval_js]_

Everything renders and functions correctly — trend bars (73–86px increasing), all three ③ variants, the detail child mounts across drawer/dock/inline. Let me verify the 이수 처리 action then hand off.

_[tool: eval_js]_

All interactions verified: navigation, three ③ variants (drawer/dock/inline), law-detail editing (해당여부·준수상태·대응메모), 교육 이수 처리, trend chart, filters. Handing off.

_[tool: update_todos]_

SHE Portal 디자인 언어(다크 GNB·오렌지 포인트·딥네이비·상태 배지)에 맞춘 인터랙티브 프로토타입을 완성했습니다.

_[tool: ready_for_verification]_

세 화면 모두 작동하는 단일 프로토타입으로 만들었습니다.

**구성**
- **좌측 다크 GNB + 흰 글로벌 헤더 + 사업장(울산공장) 선택** — 첨부 SHE Portal과 동일한 톤(차콜브라운 사이드바, 오렌지 활성 표시, 네이비 표 헤더, +more 링크 카드).
- **① 메인 대시보드** — 준수율 72% 카드 + 준수/진행중/미흡 통계, **대응 필요 항목(리스크 우선)** 리스트, 준수율 추이 막대차트, 법정교육 임박(D-30)·개정 알림(시행일 D-day) 위젯. 리스트 클릭 시 해당 화면으로 이동·해당 행 선택.
- **② 교육 이수관리** — 하반기 도래 타임라인 + 대상자 표, 행 클릭 시 우측 상세 패널에서 **이수 처리**(상태·직전이수일·차기도래일 자동 갱신).
- **③ 법규충족** — 요청하신 대로 **표+상세패널 구조 3안 토글**: `3a` 트리+우측 드로어 / `3b` 필터+고정 분할 도크 / `3c` 트리+행 인라인 확장. 상세 패널에서 해당여부·준수상태·대응 메모를 직접 편집할 수 있고, 개정 전후 비교·근거·이력을 표시합니다.
- 산안법·중대재해처벌법·위험물안전관리법·화관법 18개 조항 + 9명 교육 일정의 더미 데이터.

**참고**
- 로고/브랜드 마크는 업로드 예정이라 하셔서 헤더에 임시 "SHE Portal" 워드마크와 ACT DIGITAL 자리만 잡아뒀습니다. 이미지 주시면 교체할게요.
- ③의 세 변형 중 선호하는 안을 알려주시면 그걸 기본으로 고정하고 나머지는 정리할 수 있습니다.

## User

Address these comments from my teammates:

**ClaudeLab09**:
<teammate-comment>법령 검토등록 메뉴를 만들어야해. 대시보드에서는 각자 산재돼있는 검토 대응현황을 업로드해서 총괄 관리하는 형태로 활용해야할 것 같아. 사내 웹사이트(클래버스) 에 결재보고를 하면 자동 연동되면 제일 베스트일 것 같아. 또한 개정법규 알림은 법제처에서 입법예고 등을 통해서 개정 예정인 법규도 검토할 수 있으면 제일 좋을 것 같아. https://www.moleg.go.kr/lawinfo/makingList.mo?mid=a10104010000
</teammate-comment>

