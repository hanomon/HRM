# 🤝 기여 가이드

HRM 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트의 코드 컨벤션과 Git 규칙을 설명합니다.

## 📋 목차
- [Git 커밋 컨벤션](#-git-커밋-컨벤션)
- [브랜치 전략](#-브랜치-전략)
- [코드 컨벤션](#-코드-컨벤션)
- [PR 가이드](#-pull-request-가이드)
- [코드 리뷰](#-코드-리뷰)

---

## 📝 Git 커밋 컨벤션

### 커밋 메시지 형식

```
<타입>(<범위>): <제목>

<본문>

<푸터>
```

### 타입 (Type)

커밋의 종류를 나타냅니다:

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: NFC 태깅 재시도 기능 추가` |
| `fix` | 버그 수정 | `fix: 출퇴근 시간 계산 오류 수정` |
| `docs` | 문서 수정 | `docs: README에 설치 가이드 추가` |
| `style` | 코드 포맷팅, 세미콜론 누락 등 | `style: Prettier 적용` |
| `refactor` | 코드 리팩토링 | `refactor: API 호출 로직 개선` |
| `test` | 테스트 추가 또는 수정 | `test: 직원 모델 테스트 추가` |
| `chore` | 빌드, 설정 파일 수정 | `chore: package.json 업데이트` |
| `perf` | 성능 개선 | `perf: DB 쿼리 최적화` |
| `ci` | CI/CD 설정 수정 | `ci: GitHub Actions 추가` |
| `revert` | 이전 커밋 되돌리기 | `revert: "feat: XXX 기능" 롤백` |

### 범위 (Scope) - 선택사항

변경된 부분을 명시합니다:

- `backend`: Backend 관련
- `frontend`: Frontend 관련
- `api`: API 관련
- `ui`: UI 컴포넌트 관련
- `db`: 데이터베이스 관련
- `nfc`: NFC 기능 관련
- `employee`: 직원 관리 관련
- `attendance`: 출퇴근 관리 관련

### 제목 (Subject) 규칙

- **50자 이내**로 작성
- **명령문**으로 작성 (예: "추가한다" ❌, "추가" ✅)
- 첫 글자는 **소문자**로 시작 (타입은 소문자)
- 마침표 사용 안 함
- 한글 또는 영어 사용 가능

### 본문 (Body) - 선택사항

- 72자마다 줄바꿈
- **무엇을, 왜** 변경했는지 설명
- **어떻게** 보다는 **왜** 에 집중

### 푸터 (Footer) - 선택사항

- 이슈 번호 참조: `Closes #123`
- Breaking Changes: `BREAKING CHANGE: API 엔드포인트 변경`

### 커밋 메시지 예시

#### 예시 1: 간단한 커밋 (영어 추천)
```
feat(nfc): add retry functionality for NFC tagging
```

#### 예시 2: 상세한 커밋
```
fix(attendance): fix work hours calculation error

- Fix calculation error for shifts crossing midnight
- Improve timezone conversion logic
- Add test cases for edge cases

Closes #45
```

#### 예시 3: Breaking Change
```
feat(api): change attendance API response format

Add new fields and improve response structure

BREAKING CHANGE: API response now includes `employee_info` object
```

#### 💡 **영어 커밋 메시지 추천 이유**
- ✅ 인코딩 문제 완전 회피
- ✅ 국제적인 협업에 유리
- ✅ GitHub에서 깨짐 없이 표시
- ✅ 대부분의 오픈소스 프로젝트 표준

---

## 🌿 브랜치 전략

### 브랜치 명명 규칙

```
<타입>/<이슈번호>-<간단한-설명>
```

**예시:**
- `feat/123-nfc-retry`
- `fix/456-time-calculation`
- `docs/789-update-readme`
- `refactor/ui-components`

### 주요 브랜치

| 브랜치 | 설명 | 보호 |
|--------|------|------|
| `main` | 프로덕션 배포 브랜치 | ✅ 보호됨 |
| `develop` | 개발 통합 브랜치 (선택사항) | ✅ 보호됨 |
| `feat/*` | 새 기능 개발 | - |
| `fix/*` | 버그 수정 | - |
| `hotfix/*` | 긴급 수정 | - |

### 브랜치 생성 및 작업 흐름

```bash
# 1. 최신 main 브랜치 가져오기
git checkout main
git pull origin main

# 2. 새 브랜치 생성
git checkout -b feat/123-new-feature

# 3. 작업 및 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 4. 원격 저장소에 푸시
git push origin feat/123-new-feature

# 5. GitHub에서 Pull Request 생성
```

---

## 💻 코드 컨벤션

### TypeScript/JavaScript

#### 기본 규칙

```typescript
// ✅ 좋은 예
const employeeName = 'John Doe';
const MAX_RETRY_COUNT = 3;

// ❌ 나쁜 예
const employee_name = 'John Doe';
const max_retry_count = 3;
```

#### 변수 및 함수명

- **변수**: `camelCase`
- **상수**: `UPPER_SNAKE_CASE`
- **함수**: `camelCase`
- **클래스**: `PascalCase`
- **인터페이스**: `PascalCase`
- **타입**: `PascalCase`

```typescript
// 변수
const userName = 'John';
const isActive = true;

// 상수
const API_BASE_URL = 'http://localhost:3000';
const MAX_FILE_SIZE = 1024 * 1024;

// 함수
function calculateWorkHours() { }
const fetchEmployeeData = async () => { };

// 클래스
class EmployeeManager { }

// 인터페이스
interface Employee { }
interface AttendanceRecord { }

// 타입
type TagType = 'check_in' | 'check_out';
```

#### 함수 작성

```typescript
// ✅ 좋은 예: 한 가지 역할, 명확한 이름, 짧은 함수
async function getEmployeeByNfcId(nfcId: string): Promise<Employee | null> {
  const employee = await db.prepare(
    'SELECT * FROM employees WHERE nfc_id = ?'
  ).get(nfcId);
  
  return employee || null;
}

// ❌ 나쁜 예: 너무 긴 함수, 여러 역할
function doEverything(data: any) {
  // 100줄의 코드...
}
```

#### 타입 사용

```typescript
// ✅ 좋은 예: 명시적 타입
function createAttendance(
  employeeId: number, 
  nfcId: string, 
  tagType: 'check_in' | 'check_out'
): AttendanceRecord {
  // ...
}

// ❌ 나쁜 예: any 타입 남용
function createAttendance(data: any): any {
  // ...
}
```

#### 주석

```typescript
// ✅ 좋은 예: 필요한 경우에만
/**
 * NFC ID로 직원 정보를 조회합니다.
 * @param nfcId - NFC 카드 ID
 * @returns 직원 정보 또는 null
 */
async function getEmployeeByNfcId(nfcId: string): Promise<Employee | null> {
  // 비즈니스 로직...
}

// ❌ 나쁜 예: 불필요한 주석
// 변수 선언
const name = 'John'; // 이름을 John으로 설정
```

### React 컴포넌트

#### 컴포넌트 파일명

- `PascalCase.tsx`
- 예: `EmployeePage.tsx`, `NFCTagPage.tsx`, `DashboardPage.tsx`

#### 컴포넌트 작성

```typescript
// ✅ 좋은 예: 함수형 컴포넌트, 명확한 Props 타입
interface EmployeeCardProps {
  employee: Employee;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <div className="card">
      <h3>{employee.name}</h3>
      <p>{employee.department}</p>
      <button onClick={() => onEdit(employee.id)}>수정</button>
      <button onClick={() => onDelete(employee.id)}>삭제</button>
    </div>
  );
}

// ❌ 나쁜 예: any 타입, 불명확한 Props
export function EmployeeCard(props: any) {
  return <div>{props.data.name}</div>;
}
```

#### Hooks 사용

```typescript
// ✅ 좋은 예: 커스텀 Hook 분리
function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const fetchEmployees = async () => {
    setLoading(true);
    const data = await api.getEmployees();
    setEmployees(data);
    setLoading(false);
  };
  
  return { employees, loading, fetchEmployees };
}
```

### 파일 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Button.tsx
│   └── Modal.tsx
├── pages/              # 페이지 컴포넌트
│   ├── DashboardPage.tsx
│   └── EmployeesPage.tsx
├── services/           # API 통신 로직
│   └── api.ts
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── hooks/              # 커스텀 Hooks
│   └── useEmployees.ts
└── utils/              # 유틸리티 함수
    └── formatDate.ts
```

### SQL 쿼리

```typescript
// ✅ 좋은 예: Prepared Statement 사용
const employee = db.prepare(
  'SELECT * FROM employees WHERE nfc_id = ?'
).get(nfcId);

// ❌ 나쁜 예: SQL Injection 위험
const employee = db.exec(
  `SELECT * FROM employees WHERE nfc_id = '${nfcId}'`
);
```

---

## 🔍 Pull Request 가이드

### PR 제목

커밋 메시지와 동일한 형식:
```
feat(nfc): NFC 태깅 재시도 기능 추가
```

### PR 설명 템플릿

```markdown
## 📝 변경 사항

- 변경된 내용을 간단히 설명

## 🎯 관련 이슈

Closes #123

## ✅ 체크리스트

- [ ] 코드가 프로젝트 컨벤션을 따름
- [ ] 자체 테스트 완료
- [ ] 문서 업데이트 (필요한 경우)
- [ ] 린터 오류 없음

## 📸 스크린샷 (UI 변경 시)

(스크린샷 추가)

## 💬 추가 설명

(필요한 경우 추가 설명)
```

### PR 크기

- 작은 PR을 지향 (500줄 이하 권장)
- 하나의 PR은 하나의 기능/수정에 집중
- 대규모 리팩토링은 여러 PR로 분할

---

## 👀 코드 리뷰

### 리뷰어 체크리스트

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 코드 컨벤션을 따르는가?
- [ ] 보안 이슈는 없는가?
- [ ] 성능 문제는 없는가?
- [ ] 테스트가 충분한가?
- [ ] 문서가 업데이트되었는가?

### 리뷰 코멘트 가이드

```markdown
# ✅ 좋은 코멘트
- "이 부분은 `Array.map()`을 사용하면 더 간결할 것 같습니다."
- "보안을 위해 입력값 검증을 추가하면 좋겠습니다."

# ❌ 나쁜 코멘트
- "이 코드 이상해요."
- "다시 작성하세요."
```

---

## 🚀 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] 린터 오류 없음
- [ ] 문서 업데이트
- [ ] 버전 업데이트 (package.json)
- [ ] CHANGELOG 업데이트
- [ ] 환경변수 확인

---

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## 💡 질문이나 제안

이슈나 Discussion에 등록해주세요!

**Happy Coding! 🎉**



