import { useState, useEffect } from 'react';
import { attendanceApi } from '../services/api';
import { NFCTagResponse } from '../types';

// Web NFC API 타입 정의
interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: {
    records: Array<{
      recordType: string;
      data: any;
    }>;
  };
}

interface NDEFReader extends EventTarget {
  scan: () => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    NDEFReader: {
      new(): NDEFReader;
    };
  }
}

function NFCTagPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [lastTagged, setLastTagged] = useState<NFCTagResponse | null>(null);
  const [nfcSupported, setNfcSupported] = useState(true);

  useEffect(() => {
    // Check if Web NFC is supported
    if (!('NDEFReader' in window)) {
      setNfcSupported(false);
      setMessage('이 브라우저는 NFC를 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      setMessageType('error');
    }
  }, []);

  const startNFCScanning = async () => {
    if (!nfcSupported) {
      return;
    }

    try {
      setIsScanning(true);
      setMessage('NFC 태그를 스캔 중입니다... 카드를 태블릿에 가까이 대주세요.');
      setMessageType('info');

      const ndef = new window.NDEFReader();
      
      await ndef.scan();

      ndef.onreading = async (event: NDEFReadingEvent) => {
        const nfcId = event.serialNumber;
        console.log('NFC ID detected:', nfcId);
        
        try {
          const response = await attendanceApi.create(nfcId);
          setLastTagged(response.data as any);
          setMessage(response.data.message || '태깅 성공!');
          setMessageType('success');
          
          // Auto-clear message after 3 seconds
          setTimeout(() => {
            setMessage('NFC 태그를 스캔 중입니다...');
            setMessageType('info');
          }, 3000);
        } catch (error: any) {
          console.error('Tag processing error:', error);
          setMessage(error.response?.data?.error || '태깅 처리 중 오류가 발생했습니다.');
          setMessageType('error');
          
          setTimeout(() => {
            setMessage('NFC 태그를 스캔 중입니다...');
            setMessageType('info');
          }, 3000);
        }
      };

      ndef.onreadingerror = () => {
        setMessage('NFC 읽기 오류가 발생했습니다.');
        setMessageType('error');
      };

    } catch (error: any) {
      console.error('NFC scan error:', error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError') {
        setMessage('NFC 권한이 거부되었습니다. 브라우저 설정에서 NFC 권한을 허용해주세요.');
      } else {
        setMessage('NFC 스캔 시작 실패: ' + error.message);
      }
      setMessageType('error');
    }
  };

  const stopNFCScanning = () => {
    setIsScanning(false);
    setMessage('');
    setMessageType('info');
  };

  const getMessageColor = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getTagTypeText = (type: string) => {
    return type === 'check_in' ? '출근' : '퇴근';
  };

  const getTagTypeColor = (type: string) => {
    return type === 'check_in' ? 'text-green-600' : 'text-orange-600';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          NFC 출퇴근 태깅
        </h1>

        <div className="flex flex-col items-center space-y-6">
          {/* NFC Icon */}
          <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`w-full p-4 rounded-lg border-2 ${getMessageColor()} transition-all`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {/* Last Tagged Info */}
          {lastTagged && (
            <div className="w-full p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">최근 태깅 정보</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">직원명:</span> {lastTagged.employee_name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">구분:</span>{' '}
                  <span className={`font-bold ${getTagTypeColor(lastTagged.tag_type)}`}>
                    {getTagTypeText(lastTagged.tag_type)}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">시간:</span>{' '}
                  {new Date().toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="w-full space-y-3">
            {!isScanning ? (
              <button
                onClick={startNFCScanning}
                disabled={!nfcSupported}
                className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition-colors ${
                  nfcSupported
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {nfcSupported ? 'NFC 스캔 시작' : 'NFC 미지원'}
              </button>
            ) : (
              <button
                onClick={stopNFCScanning}
                className="w-full py-4 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-colors"
              >
                스캔 중지
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="w-full p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">사용 방법</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. "NFC 스캔 시작" 버튼을 누릅니다</li>
              <li>2. NFC 카드를 태블릿에 가까이 갖다 댑니다</li>
              <li>3. 출퇴근이 자동으로 기록됩니다</li>
              <li>4. 출근 → 퇴근 → 출근 순으로 자동 전환됩니다</li>
            </ul>
          </div>

          {!nfcSupported && (
            <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">주의사항</h4>
              <p className="text-sm text-red-700">
                Web NFC는 Android의 Chrome 브라우저에서만 지원됩니다. 
                iOS(iPhone/iPad)에서는 네이티브 앱이 필요합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NFCTagPage;

