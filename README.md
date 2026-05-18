# HVVN Store

아티스트 hvvn 의 굿즈 판매 사이트.
Next.js 15 (App Router) + TypeScript + Tailwind + Supabase + Vercel.

## 빠른 시작

```bash
pnpm install # or npm / yarn
cp .env.example .env.local
# .env.local에 Supabase / Google 값 채우기
pnpm dev
```

## Supabase 설정

1. https://supabase.com 에서 새 프로젝트 생성.
2. **SQL Editor** 에서 `db/schema.sql` 의 내용을 실행.
3. **Storage** → New bucket → 이름 `product-images`, **Public** 체크.
4. **Authentication** → Users → 관리자 이메일/비밀번호 추가.
5. Project Settings → API 에서 다음 키를 `.env.local` 에 복사:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, 절대 노출 금지)

## Google OAuth 연동 (선택)

문의 답변·재입고 알림을 Gmail로 발송하려면:

1. Google Cloud Console → APIs & Services → Library:
   - Gmail API 활성화
   - Google Drive API 활성화 (선택)
2. OAuth consent screen 설정 후, Credentials → OAuth 2.0 Client ID (Web) 생성.
3. **Authorized redirect URI** 에 다음을 추가:
   - 로컬: `http://localhost:3000/api/integrations/google/callback`
   - 운영: `https://<your-vercel-domain>/api/integrations/google/callback`
4. `.env.local` 에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` 입력.
5. `/admin/integrations` 에서 Connect 클릭.

> 카카오·네이버 같은 다른 서비스도 `lib/integrations/<provider>.ts` 에 같은 인터페이스로 추가하면 관리자 UI에 자동 노출됩니다.

## Vercel 배포

1. GitHub 저장소를 Vercel에 import.
2. 환경 변수 모두 추가.
3. Build command / output directory 는 기본값.
4. 배포 후 `GOOGLE_REDIRECT_URI` 를 운영 도메인 기준으로 변경.

## 기본 경로

| Path | 설명 |
| --- | --- |
| `/` | 메인 (상품 그리드/리스트 + About) |
| `/products/[slug]` | 상품 상세 |
| `/cart` | 장바구니 |
| `/checkout` → `/checkout/complete?order=…` | 주문/결제(무통장입금) |
| `/orders` | 이름+전화번호로 주문 조회 |
| `/admin` | 관리자 대시보드 (로그인 필요) |
| `/admin/orders` | 주문 관리 |
| `/admin/products` | 상품 관리 |
| `/admin/sets/new` | 세트 상품 생성 |
| `/admin/waitlist` | 재입고 알림 대기 |
| `/admin/inquiries` | 문의 |
| `/admin/integrations` | 외부 서비스 연동 |
| `/admin/settings` | 계좌·배송비·About 설정 |

## 디자인 시스템

- 컬러: paper `#F5F2EC`, ink `#1A1A18`, sand `#EFE9DD`, line `#E5E0D6`
- 타이포: Pretendard (본문), Newsreader (디스플레이/세리프)
- 톤: 한국 인디샵 (ritasalt) 느낌의 미니멀 페이퍼톤. 얇은 라인, 큰 여백.

## 로고

`hvvn` 텍스트 로고를 임시로 사용 중. 정식 로고 SVG/PNG가 준비되면 `components/site-header.tsx` 의 `<span aria-label="hvvn">hvvn.</span>` 부분을 `<Image src=... />` 로 교체.
