import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByNfcId,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController';

const router = Router();

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.get('/nfc/:nfc_id', getEmployeeByNfcId);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;

