/**
 * NFC ID 정규화 유틸리티
 * 콜론(:)을 제거하고 대문자로 통일
 */

/**
 * NFC ID를 정규화합니다.
 * - 콜론(:) 제거
 * - 대문자로 변환
 * - 숫자와 알파벳만 허용
 * 
 * @param nfcId - 원본 NFC ID (예: "04:A1:B2:C3" 또는 "04a1b2c3")
 * @returns 정규화된 NFC ID (예: "04A1B2C3")
 * 
 * @example
 * normalizeNfcId("04:A1:B2:C3:D4:E5:F6") // "04A1B2C3D4E5F6"
 * normalizeNfcId("04a1b2c3d4e5f6") // "04A1B2C3D4E5F6"
 * normalizeNfcId("04-A1-B2-C3") // "04A1B2C3"
 */
export function normalizeNfcId(nfcId: string): string {
  if (!nfcId) {
    return '';
  }
  
  // 콜론, 대시, 공백 등 특수문자 제거하고 대문자로 변환
  return nfcId
    .replace(/[^0-9A-Fa-f]/g, '') // 숫자와 알파벳(hex)만 허용
    .toUpperCase();
}

/**
 * NFC ID 유효성 검증
 * @param nfcId - 검증할 NFC ID
 * @returns 유효 여부
 */
export function isValidNfcId(nfcId: string): boolean {
  const normalized = normalizeNfcId(nfcId);
  
  // 최소 8자, 최대 32자 (일반적인 NFC ID 길이)
  if (normalized.length < 8 || normalized.length > 32) {
    return false;
  }
  
  // Hex 문자만 포함되어 있는지 확인
  return /^[0-9A-F]+$/.test(normalized);
}

/**
 * NFC ID를 사람이 읽기 쉬운 형식으로 포맷
 * @param nfcId - NFC ID
 * @param separator - 구분자 (기본값: ':')
 * @returns 포맷된 NFC ID (예: "04:A1:B2:C3:D4:E5:F6")
 */
export function formatNfcId(nfcId: string, separator: string = ':'): string {
  const normalized = normalizeNfcId(nfcId);
  
  // 2자리씩 끊어서 구분자로 연결
  return normalized.match(/.{1,2}/g)?.join(separator) || normalized;
}

