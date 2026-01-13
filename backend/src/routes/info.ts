import { Router } from 'express';
import { getInfoByNfcId, getInfoByNfcIdPost } from '../controllers/infoController';

const router = Router();

// GET /api/info/:nfc_id - NFC ID로 직원 출근 정보 조회
router.get('/:nfc_id', getInfoByNfcId);

// POST /api/info - NFC ID로 직원 출근 정보 조회 (Body: {nfc_id})
router.post('/', getInfoByNfcIdPost);

export default router;

