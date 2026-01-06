# 📝 커밋 메시지 가이드

영어 커밋 메시지 작성을 위한 실용적인 가이드입니다.

## 🎯 기본 형식

```
<type>(<scope>): <subject>
```

## 📚 자주 사용하는 커밋 메시지

### feat (새 기능)

```bash
feat: add NFC tagging feature
feat(ui): add employee list pagination
feat(api): add Excel export endpoint
feat(nfc): implement retry mechanism for failed tags
feat(auth): add user authentication
```

### fix (버그 수정)

```bash
fix: correct timezone calculation
fix(ui): fix employee list sorting
fix(api): handle null values in attendance records
fix(nfc): prevent duplicate tagging
fix(db): fix foreign key constraint error
```

### docs (문서)

```bash
docs: update README with deployment guide
docs: add API documentation
docs: update installation instructions
docs(api): document new endpoints
```

### style (코드 포맷팅)

```bash
style: format code with Prettier
style: fix indentation
style: remove trailing whitespaces
```

### refactor (리팩토링)

```bash
refactor: simplify attendance calculation logic
refactor(api): restructure employee routes
refactor: extract common utilities
refactor(ui): optimize component rendering
```

### test (테스트)

```bash
test: add employee model tests
test(api): add attendance endpoint tests
test: improve test coverage
```

### chore (기타)

```bash
chore: update dependencies
chore: configure build settings
chore: add .gitignore entries
chore(deps): bump react version to 18.2
```

## 🚀 프로젝트 특화 예시

### NFC 기능

```bash
feat(nfc): add NFC reader initialization
feat(nfc): implement tag scanning
fix(nfc): handle NFC permission denial
fix(nfc): improve tag reading reliability
refactor(nfc): simplify tag handler logic
```

### 직원 관리

```bash
feat(employee): add employee registration
feat(employee): implement employee search
fix(employee): fix duplicate NFC ID validation
fix(employee): correct employee update logic
```

### 출퇴근 기록

```bash
feat(attendance): add check-in/out detection
feat(attendance): implement Excel export
fix(attendance): fix work hours calculation
fix(attendance): handle midnight crossing
refactor(attendance): optimize query performance
```

### UI 컴포넌트

```bash
feat(ui): add dashboard page
feat(ui): implement employee table
fix(ui): fix responsive layout on mobile
style(ui): improve button styling
```

## 💬 좋은 커밋 메시지 작성 팁

### ✅ Good Examples

```bash
feat(nfc): add retry on failed tag read
# Clear, specific, actionable

fix(api): prevent duplicate attendance records
# Explains what problem was fixed

refactor(db): optimize employee query performance
# Shows improvement purpose
```

### ❌ Bad Examples

```bash
update stuff
# Too vague

fixed bug
# Doesn't explain what bug

WIP
# Not descriptive
```

## 🎨 Subject 작성 규칙

### 동사로 시작 (명령문)

```bash
✅ add feature
✅ fix bug
✅ update docs

❌ added feature
❌ fixes bug
❌ updating docs
```

### 50자 이내

```bash
✅ feat(nfc): add tag retry mechanism
❌ feat(nfc): add a new retry mechanism for NFC tag reading when it fails for the first time
```

### 소문자로 시작

```bash
✅ feat: add new feature
❌ Feat: Add New Feature
```

### 마침표 없음

```bash
✅ feat: add feature
❌ feat: add feature.
```

## 🔤 자주 사용하는 동사

| 동사 | 의미 | 예시 |
|------|------|------|
| add | 추가 | `add user authentication` |
| implement | 구현 | `implement Excel export` |
| create | 생성 | `create database schema` |
| update | 업데이트 | `update dependencies` |
| improve | 개선 | `improve performance` |
| fix | 수정 | `fix timezone bug` |
| correct | 정정 | `correct calculation logic` |
| resolve | 해결 | `resolve merge conflicts` |
| remove | 제거 | `remove deprecated code` |
| delete | 삭제 | `delete unused files` |
| refactor | 리팩터 | `refactor API structure` |
| optimize | 최적화 | `optimize database queries` |
| simplify | 단순화 | `simplify error handling` |
| change | 변경 | `change API response format` |
| rename | 이름변경 | `rename variables for clarity` |
| move | 이동 | `move files to new directory` |

## 📦 Body 작성 (선택사항)

상세한 설명이 필요한 경우:

```bash
feat(attendance): add automatic check-in/out detection

Implement logic to automatically determine whether a tag
should be recorded as check-in or check-out based on the
employee's last record.

- Check last attendance record
- Determine action based on timestamp
- Handle edge cases (midnight, multiple tags)

Closes #123
```

## 🏷️ Footer (선택사항)

```bash
# 이슈 연결
Closes #123
Fixes #456
Resolves #789

# Breaking Change
BREAKING CHANGE: API endpoint changed from /api/v1 to /api/v2

# Multiple issues
Closes #123, #456, #789
```

## 🌟 실전 예시

### 기능 개발 플로우

```bash
# 1. 기능 추가
git commit -m "feat(employee): add employee search functionality"

# 2. 버그 발견 및 수정
git commit -m "fix(employee): fix search input validation"

# 3. 테스트 추가
git commit -m "test(employee): add search tests"

# 4. 문서 업데이트
git commit -m "docs: update employee API documentation"

# 5. 코드 리팩터링
git commit -m "refactor(employee): optimize search query"
```

## 🔧 커밋 수정하기

### 마지막 커밋 수정

```bash
# 커밋 메시지만 수정
git commit --amend -m "feat(nfc): add tag validation"

# 파일 추가 후 커밋 수정
git add forgotten-file.ts
git commit --amend --no-edit
```

## 📊 프로젝트 통계

GitHub에서 커밋 메시지로 통계를 볼 수 있습니다:

```bash
# 커밋 타입별 통계
git log --oneline | grep "feat:" | wc -l
git log --oneline | grep "fix:" | wc -l
```

## 🌐 다국어 커밋

영어가 어려울 때 사용할 수 있는 간단한 패턴:

```bash
# 행동 + 대상
feat: add [feature name]
fix: correct [what was wrong]
update: change [what changed]
remove: delete [what was removed]

# 예시
feat: add retry button
fix: correct time format
update: change API URL
remove: delete old code
```

## 🎓 학습 리소스

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

## 💡 번역 도움

커밋 메시지 작성이 어려울 때:

### 구글 번역 활용
```
한글: NFC 태깅 기능 추가
영어: add NFC tagging feature
→ feat(nfc): add tagging feature
```

### ChatGPT/AI 활용
```
"이 변경사항을 영어 커밋 메시지로 작성해줘:
- NFC 태깅 재시도 기능 추가
- 3번까지 재시도
- 실패 시 에러 메시지 표시"

→ feat(nfc): add retry mechanism for tag reading
```

---

**팁**: 자주 사용하는 커밋 메시지를 메모장에 저장해두고 복사해서 사용하세요!

