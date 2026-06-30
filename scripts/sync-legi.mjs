// ─────────────────────────────────────────────────────────────────────────────
// 법제처 정부입법예고 → Firestore(legi) 동기화 스크립트
//
// GitHub Actions에서 서버사이드로 실행된다(브라우저 CORS 회피).
// data.go.kr 데이터셋 15058407 "법제처_정부입법예고"를 호출하여
// 우리 부서 관련 법령만 필터링해 Firestore `legi` 컬렉션에 upsert 한다.
//
// 필요한 환경변수(시크릿):
//   DATA_GO_KR_KEY            data.go.kr 일반 인증키(Decoding 키 권장)
//   FIREBASE_SERVICE_ACCOUNT  Firebase 서비스계정 JSON 문자열 전체
// 선택(레포 Variable):
//   DATA_API_URL              요청주소(엔드포인트). 데이터셋 명세의 '요청주소'로 덮어쓰기
// ─────────────────────────────────────────────────────────────────────────────

import admin from 'firebase-admin';
import { XMLParser } from 'fast-xml-parser';

// ── 설정 ──────────────────────────────────────────────────────────────────────

// odcloud 표준 API (법제처_입법예고관련정보, namespace 15123431/v1).
// 엔드포인트는 OAS 명세로 확정됨. 필요 시 레포 Variable DATA_API_URL 로 덮어쓰기 가능.
const API_URL = process.env.DATA_API_URL
  || 'https://api.odcloud.kr/api/15123431/v1/uddi:9de4f5a7-ba4a-4400-b756-f88bb73ba5af';

const SERVICE_KEY = process.env.DATA_GO_KR_KEY || '';   // Decoding 키 권장(스크립트가 인코딩)
const SA_JSON = process.env.FIREBASE_SERVICE_ACCOUNT || '';

const PER_PAGE = 100;   // 페이지당 건수 (odcloud perPage)
const MAX_PAGES = 5;    // 최근 최대 500건만 훑어 필터링

// 우리 부서 관련 법령(발행명에 키워드 포함 시 대상). 이 API엔 소관부처 필드가
// 없으므로, 매칭된 키워드로 소관부처를 도출한다.
//  - 산업안전보건법 / 시행령 / 시행규칙 / 산업안전보건기준에 관한 규칙 / 관련 고시  → 고용노동부
//  - 위험물안전관리법 / 시행령 / 시행규칙                                          → 소방청
const RELEVANT = [
  { keyword: '산업안전보건', ministry: '고용노동부' },
  { keyword: '위험물안전관리', ministry: '소방청' },
];
function matchRelevant(name) {
  const n = (name || '').replace(/\s/g, '');
  return RELEVANT.find(r => n.includes(r.keyword)) || null;
}

// 데모 시드 문서 id(앱이 최초 시드한 가짜 데이터) — 동기화 성공 시 제거
const DEMO_LEGI_IDS = ['l1', 'l2', 'l3', 'l4', 'l5'];

// 응답 필드명 매핑 (OAS 확정: 발행명/공고번호/공고일자/입법예고시작일자/입법예고종료일자/입법예고파일내용)
const F = {
  id:      ['공고번호', '입법예고파일번호', '입법예고일련번호'],
  law:     ['발행명', '법령명', '입법예고명'],
  notice:  ['입법예고시작일자', '공고일자'],
  closing: ['입법예고종료일자'],
  summary: ['입법예고파일내용', '주요내용', '제안이유'],
};

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== '') return String(obj[k]).trim();
  }
  return '';
}

// '20260615' | '2026.06.15' | '2026-06-15' → '2026-06-15'
function normDate(s) {
  if (!s) return '';
  const digits = s.replace(/[^0-9]/g, '');
  if (digits.length >= 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
  return s;
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const d1 = new Date(a + 'T00:00:00'), d2 = new Date(b + 'T00:00:00');
  if (isNaN(d1) || isNaN(d2)) return null;
  return Math.round((d2 - d1) / 86400000);
}

// 응답(JSON/XML)에서 item 배열을 최대한 견고하게 추출
function extractItems(payload) {
  // 흔한 컨테이너 경로들을 탐색 (odcloud는 data[] 사용)
  const paths = [
    p => p?.data,                          // odcloud 표준
    p => p?.response?.body?.items?.item,
    p => p?.response?.body?.items,
    p => p?.body?.items?.item,
    p => p?.items?.item,
    p => p?.LawSearch?.law,
    p => p?.lawList,
    p => p?.list,
  ];
  for (const get of paths) {
    const v = get(payload);
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return [v];
  }
  // 마지막 수단: 최상위에서 배열인 첫 값
  if (payload && typeof payload === 'object') {
    for (const k of Object.keys(payload)) if (Array.isArray(payload[k])) return payload[k];
  }
  return [];
}

async function fetchPage(page) {
  // odcloud 표준: page / perPage / serviceKey(인코딩) / returnType
  // Decoding 키를 encodeURIComponent 로 인코딩 → Encoding 키와 동일해짐
  const sep = API_URL.includes('?') ? '&' : '?';
  const url = `${API_URL}${sep}page=${page}&perPage=${PER_PAGE}`
    + `&returnType=JSON&serviceKey=${encodeURIComponent(SERVICE_KEY)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 300)}`);

  const trimmed = text.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(text);
  }
  // XML 폴백
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  return parser.parse(text);
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_URL) throw new Error('레포 Variable DATA_API_URL 이 비어 있습니다. Swagger의 전체 요청주소(uddi 포함)를 지정하세요.');
  if (!SERVICE_KEY) throw new Error('환경변수 DATA_GO_KR_KEY 가 비어 있습니다.');
  if (!SA_JSON) throw new Error('환경변수 FIREBASE_SERVICE_ACCOUNT 가 비어 있습니다.');

  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(SA_JSON)) });
  const db = admin.firestore();
  const col = db.collection('legi');

  // 1) 수집
  let raw = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const payload = await fetchPage(page);
    const items = extractItems(payload);
    if (page === 1) {
      console.log('── 원본 응답 샘플(필드명 확인용) ──');
      console.log(JSON.stringify(items[0] || payload, null, 2).slice(0, 1500));
      console.log('───────────────────────────────');
    }
    if (!items.length) break;
    raw.push(...items);
    if (items.length < PER_PAGE) break;
  }
  console.log(`수집된 입법예고 총 ${raw.length}건`);

  // 2) 정규화 + 필터 (소관부처는 매칭 키워드로 도출)
  const mapped = raw.map((it, i) => {
    const law = pick(it, F.law);
    const rel = matchRelevant(law);
    if (!law || !rel) return null;
    const notice = normDate(pick(it, F.notice));
    const closing = normDate(pick(it, F.closing));
    const period = (() => { const d = daysBetween(notice, closing); return d != null ? `${d}일` : ''; })();
    const idRaw = pick(it, F.id) || `${law}_${notice}` || `idx${i}`;
    return {
      docId: 'gov_' + idRaw.replace(/[^0-9a-zA-Z가-힣_-]/g, ''),
      law, ministry: rel.ministry, noticeDate: notice, closingDate: closing, period,
      summary: pick(it, F.summary),
    };
  }).filter(Boolean);

  console.log(`관련 법령(${RELEVANT.map(r => r.keyword).join(', ')}) 필터 후 ${mapped.length}건`);
  mapped.forEach(m => console.log(`  · ${m.law} (${m.ministry}) 마감 ${m.closingDate}`));

  // 3) Firestore upsert (검토 상태는 기존 값 보존)
  let written = 0;
  for (const m of mapped) {
    const ref = col.doc(m.docId);
    const snap = await ref.get();
    const status = snap.exists ? (snap.data().status || '검토전') : '검토전';
    await ref.set({
      law: m.law, ministry: m.ministry,
      noticeDate: m.noticeDate, closingDate: m.closingDate, period: m.period,
      summary: m.summary, status,
      source: 'data.go.kr',
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    written++;
  }
  console.log(`Firestore 반영 ${written}건`);

  // 4) 데모 시드 제거(최초 1회 정리)
  for (const id of DEMO_LEGI_IDS) {
    await col.doc(id).delete().catch(() => {});
  }

  console.log('동기화 완료');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('동기화 실패:', err);
  process.exit(1);
});
