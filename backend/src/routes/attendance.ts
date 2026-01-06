import { Router } from 'express';
import {
  getAllRecords,
  getRecordsByEmployeeId,
  createRecord,
  deleteRecord,
  exportToExcel
} from '../controllers/attendanceController';

const router = Router();

router.get('/', getAllRecords);
router.get('/employee/:employeeId', getRecordsByEmployeeId);
router.get('/export/excel', exportToExcel);
router.post('/', createRecord);
router.delete('/:id', deleteRecord);

export default router;

