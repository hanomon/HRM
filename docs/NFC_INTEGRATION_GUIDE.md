# 🔷 NFC 태깅 통합 가이드

> **담당 개발자**: NFC 하드웨어 및 통신 담당자용  
> **최종 업데이트**: 2026-01-06

## 📋 목차
- [개요](#-개요)
- [요구사항](#-요구사항)
- [API 엔드포인트](#-api-엔드포인트)
- [Web NFC API 사용법](#-web-nfc-api-사용법)
- [통합 예제](#-통합-예제)
- [테스트 방법](#-테스트-방법)
- [문제 해결](#-문제-해결)

---

## 🎯 개요

이 시스템은 **Web NFC API**를 사용하여 Android 태블릿에서 NFC 카드 태깅을 처리합니다.

### 작동 방식
```
NFC 카드 태깅
    ↓
Web NFC API로 NFC ID 읽기
    ↓
Backend API로 NFC ID 전송
    ↓
출근/퇴근 자동 판단 및 기록
```

---

## ✅ 요구사항

### 하드웨어
- **Android 기기** (NFC 지원)
- **NFC 활성화** (기기 설정에서)
- **Chrome 또는 Edge 브라우저**

### 소프트웨어
- **HTTPS 연결** 필수 (로컬은 `localhost` 예외)
- **Web NFC API 지원** (Chrome 89+)

### 지원 불가
- ❌ iOS (iPhone/iPad)
- ❌ Safari 브라우저
- ❌ HTTP 연결 (HTTPS 필수)

---

## 🔌 API 엔드포인트

### Base URL
```
개발: http://localhost:3000/api
프로덕션: https://hrm-backend-1dk5.onrender.com/api
```

### 출퇴근 태깅 API

#### `POST /api/attendance`

**요청:**
```http
POST /api/attendance
Content-Type: application/json

{
  "nfc_id": "04:A1:B2:C3:D4:E5:F6"
}
```

**성공 응답 (출근):**
```json
{
  "id": 123,
  "employee_id": 1,
  "employee_name": "김철수",
  "nfc_id": "04:A1:B2:C3:D4:E5:F6",
  "tag_type": "check_in",
  "tag_time": "2026-01-06T08:45:00.000Z",
  "message": "출근 처리되었습니다."
}
```

**성공 응답 (퇴근):**
```json
{
  "id": 124,
  "employee_id": 1,
  "employee_name": "김철수",
  "nfc_id": "04:A1:B2:C3:D4:E5:F6",
  "tag_type": "check_out",
  "tag_time": "2026-01-06T18:30:00.000Z",
  "message": "퇴근 처리되었습니다."
}
```

**에러 응답 (미등록 직원):**
```json
{
  "error": "등록되지 않은 NFC 카드입니다."
}
```

### 출퇴근 자동 판단 로직

Backend가 자동으로 판단:
1. **출근 (`check_in`)**:
   - 오늘 첫 태깅
   - 또는 마지막 기록이 `check_out`인 경우

2. **퇴근 (`check_out`)**:
   - 마지막 기록이 `check_in`인 경우

---

## 📱 Web NFC API 사용법

### 1. NFC 지원 확인

```javascript
// NFC 지원 여부 체크
if ('NDEFReader' in window) {
  console.log('✅ Web NFC 지원');
} else {
  console.log('❌ Web NFC 미지원');
  alert('이 기기는 NFC를 지원하지 않습니다.');
}
```

### 2. NFC 태그 읽기

```javascript
async function startNFCScanning() {
  try {
    const ndef = new NDEFReader();
    
    // NFC 권한 요청 및 스캔 시작
    await ndef.scan();
    console.log('🔍 NFC 스캔 시작...');

    // NFC 태그 감지 이벤트
    ndef.addEventListener('reading', ({ message, serialNumber }) => {
      console.log('📡 NFC 태그 감지:', serialNumber);
      
      // NFC ID 포맷 변환 (예: "04a1b2c3d4e5f6" → "04:A1:B2:C3:D4:E5:F6")
      const nfcId = formatNFCId(serialNumber);
      
      // Backend API 호출
      sendAttendanceTag(nfcId);
    });

    ndef.addEventListener('readingerror', () => {
      console.error('❌ NFC 읽기 오류');
    });

  } catch (error) {
    console.error('NFC 스캔 실패:', error);
    if (error.name === 'NotAllowedError') {
      alert('NFC 권한이 거부되었습니다. 브라우저 설정에서 NFC 권한을 허용해주세요.');
    }
  }
}
```

### 3. NFC ID 포맷 변환

```javascript
/**
 * NFC Serial Number를 표준 포맷으로 변환
 * @param {string} serialNumber - "04a1b2c3d4e5f6" 형식
 * @returns {string} - "04:A1:B2:C3:D4:E5:F6" 형식
 */
function formatNFCId(serialNumber) {
  return serialNumber
    .toUpperCase()
    .match(/.{1,2}/g)
    .join(':');
}

// 예제
formatNFCId('04a1b2c3d4e5f6');  // "04:A1:B2:C3:D4:E5:F6"
```

### 4. Backend API 호출

```javascript
/**
 * 출퇴근 태깅 API 호출
 * @param {string} nfcId - "04:A1:B2:C3:D4:E5:F6" 형식
 */
async function sendAttendanceTag(nfcId) {
  try {
    const API_URL = 'https://hrm-backend-1dk5.onrender.com/api';
    
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nfc_id: nfcId })
    });

    const data = await response.json();

    if (response.ok) {
      // 성공
      console.log('✅ 태깅 성공:', data);
      showSuccessMessage(data);
    } else {
      // 실패
      console.error('❌ 태깅 실패:', data.error);
      showErrorMessage(data.error);
    }
  } catch (error) {
    console.error('API 호출 오류:', error);
    showErrorMessage('서버와 통신할 수 없습니다.');
  }
}

/**
 * 성공 메시지 표시
 */
function showSuccessMessage(data) {
  const tagTypeKorean = data.tag_type === 'check_in' ? '출근' : '퇴근';
  const message = `${data.employee_name}님\n${tagTypeKorean} 처리되었습니다.`;
  
  alert(message);
  // 또는 UI에 표시
}

/**
 * 에러 메시지 표시
 */
function showErrorMessage(errorMessage) {
  alert(`오류: ${errorMessage}`);
}
```

---

## 🔄 통합 예제

### 완전한 NFC 태깅 구현

```javascript
class NFCAttendanceSystem {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.ndef = null;
    this.isScanning = false;
  }

  /**
   * NFC 지원 확인
   */
  isSupported() {
    return 'NDEFReader' in window;
  }

  /**
   * NFC 스캔 시작
   */
  async startScanning() {
    if (!this.isSupported()) {
      throw new Error('이 기기는 NFC를 지원하지 않습니다.');
    }

    if (this.isScanning) {
      console.log('이미 스캔 중입니다.');
      return;
    }

    try {
      this.ndef = new NDEFReader();
      await this.ndef.scan();
      
      this.isScanning = true;
      console.log('🔍 NFC 스캔 시작...');

      // 태그 읽기 이벤트
      this.ndef.addEventListener('reading', this.handleNFCTag.bind(this));
      
      // 에러 이벤트
      this.ndef.addEventListener('readingerror', () => {
        console.error('❌ NFC 읽기 오류');
      });

    } catch (error) {
      this.isScanning = false;
      throw error;
    }
  }

  /**
   * NFC 스캔 중지
   */
  stopScanning() {
    if (this.ndef) {
      this.ndef.removeEventListener('reading', this.handleNFCTag);
      this.ndef = null;
      this.isScanning = false;
      console.log('⏹️ NFC 스캔 중지');
    }
  }

  /**
   * NFC 태그 처리
   */
  async handleNFCTag({ serialNumber }) {
    console.log('📡 NFC 태그 감지:', serialNumber);
    
    const nfcId = this.formatNFCId(serialNumber);
    await this.sendAttendanceTag(nfcId);
  }

  /**
   * NFC ID 포맷 변환
   */
  formatNFCId(serialNumber) {
    return serialNumber
      .toUpperCase()
      .match(/.{1,2}/g)
      .join(':');
  }

  /**
   * 출퇴근 태깅 API 호출
   */
  async sendAttendanceTag(nfcId) {
    try {
      const response = await fetch(`${this.apiUrl}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfc_id: nfcId })
      });

      const data = await response.json();

      if (response.ok) {
        this.onSuccess(data);
      } else {
        this.onError(data.error || '알 수 없는 오류');
      }
    } catch (error) {
      this.onError('서버와 통신할 수 없습니다.');
    }
  }

  /**
   * 성공 콜백
   */
  onSuccess(data) {
    const tagType = data.tag_type === 'check_in' ? '출근' : '퇴근';
    console.log(`✅ ${data.employee_name} - ${tagType} 완료`);
    
    // UI 업데이트 또는 알림
    this.showNotification({
      type: 'success',
      name: data.employee_name,
      tagType: tagType,
      time: new Date(data.tag_time).toLocaleTimeString('ko-KR')
    });
  }

  /**
   * 에러 콜백
   */
  onError(errorMessage) {
    console.error('❌ 오류:', errorMessage);
    
    this.showNotification({
      type: 'error',
      message: errorMessage
    });
  }

  /**
   * 알림 표시 (구현 필요)
   */
  showNotification(data) {
    if (data.type === 'success') {
      alert(`${data.name}님\n${data.tagType} 처리되었습니다.\n시간: ${data.time}`);
    } else {
      alert(`오류: ${data.message}`);
    }
  }
}

// 사용 예제
const nfcSystem = new NFCAttendanceSystem('https://hrm-backend-1dk5.onrender.com/api');

// NFC 스캔 시작 버튼
document.getElementById('startButton').addEventListener('click', async () => {
  try {
    await nfcSystem.startScanning();
    console.log('NFC 스캔이 시작되었습니다.');
  } catch (error) {
    console.error('NFC 스캔 시작 실패:', error);
    alert(error.message);
  }
});

// NFC 스캔 중지 버튼
document.getElementById('stopButton').addEventListener('click', () => {
  nfcSystem.stopScanning();
});
```

---

## 🧪 테스트 방법

### 1. NFC 카드 없이 테스트 (개발 중)

브라우저 콘솔에서:

```javascript
// 출근 태깅 시뮬레이션
fetch('https://hrm-backend-1dk5.onrender.com/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04:A1:B2:C3:D4:E5:F6' })
})
.then(res => res.json())
.then(data => console.log('출근:', data));

// 퇴근 태깅 시뮬레이션 (다시 실행)
fetch('https://hrm-backend-1dk5.onrender.com/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04:A1:B2:C3:D4:E5:F6' })
})
.then(res => res.json())
.then(data => console.log('퇴근:', data));
```

### 2. 테스트 직원 데이터 생성

```javascript
// Seed API로 테스트 직원 생성
fetch('https://hrm-backend-1dk5.onrender.com/api/seed', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log('테스트 데이터 생성:', data));
```

생성되는 테스트 직원:
| 이름 | NFC ID |
|------|--------|
| 김철수 | `04:A1:B2:C3:D4:E5:F6` |
| 이영희 | `04:B2:C3:D4:E5:F6:A1` |
| 박민수 | `04:C3:D4:E5:F6:A1:B2` |

### 3. 실제 Android 기기에서 테스트

1. **Android 기기 설정**:
   - NFC 활성화
   - Chrome 브라우저 최신 버전 설치

2. **테스트 페이지 접속**:
   ```
   https://hrm-frontend-3tph.onrender.com
   ```

3. **NFC 태깅 페이지로 이동**:
   - 상단 메뉴 → "NFC 태깅" 클릭

4. **스캔 시작**:
   - "NFC 스캔 시작" 버튼 클릭
   - NFC 권한 허용

5. **카드 태깅**:
   - NFC 카드를 태블릿에 가까이 대기
   - 결과 확인

---

## 🐛 문제 해결

### "NFC를 지원하지 않는 기기입니다"

**원인:**
- iOS 기기 사용
- 구형 Android 버전
- Chrome 89 미만 버전

**해결:**
```javascript
if (!('NDEFReader' in window)) {
  console.log('브라우저:', navigator.userAgent);
  console.log('HTTPS:', window.location.protocol === 'https:');
  alert('Chrome 89+ 버전의 Android 기기가 필요합니다.');
}
```

### "NotAllowedError: NFC 권한 거부"

**원인:**
- 사용자가 NFC 권한 거부
- 기기 설정에서 NFC 비활성화

**해결:**
1. Chrome 설정 → 사이트 설정 → NFC → 허용
2. 기기 설정 → NFC → 활성화

### "등록되지 않은 NFC 카드입니다"

**원인:**
- Backend에 등록되지 않은 NFC ID

**해결:**
1. 직원 관리 페이지에서 직원 등록
2. 또는 테스트 데이터 생성:
   ```javascript
   fetch('https://hrm-backend-1dk5.onrender.com/api/seed', {
     method: 'POST'
   });
   ```

### CORS 에러

**원인:**
- Backend에서 허용하지 않는 도메인에서 요청

**현재 허용된 도메인:**
- `http://localhost:5173`
- `https://*.vercel.app`
- `https://*.onrender.com`

**확인:**
```javascript
fetch('https://hrm-backend-1dk5.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend 상태:', data));
```

---

## 📚 추가 리소스

### 공식 문서
- [Web NFC API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API)
- [NFC in Chrome - Google](https://web.dev/nfc/)

### 프로젝트 문서
- [메인 README](../README.md)
- [API 문서](../README.md#-api-엔드포인트)
- [배포 가이드](../DEPLOYMENT.md)

### 테스트 환경
- **Frontend**: https://hrm-frontend-3tph.onrender.com
- **Backend API**: https://hrm-backend-1dk5.onrender.com/api
- **Health Check**: https://hrm-backend-1dk5.onrender.com/api/health

---

## 📞 문의

NFC 통합 관련 문제가 있으면 이슈를 등록해주세요:
- GitHub Issues: https://github.com/hanomon/HRM/issues

---

**작성**: HRM 개발팀  
**최종 업데이트**: 2026-01-06  
**버전**: 1.0.0


