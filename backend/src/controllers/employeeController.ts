import { Request, Response } from 'express';
import { EmployeeModel } from '../models/employee';
import { normalizeNfcId, isValidNfcId } from '../utils/nfcUtils';

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await EmployeeModel.getAll();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: '직원 목록을 가져오는데 실패했습니다.' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await EmployeeModel.getById(id);
    
    if (!employee) {
      return res.status(404).json({ error: '직원을 찾을 수 없습니다.' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: '직원 정보를 가져오는데 실패했습니다.' });
  }
};

export const getEmployeeByNfcId = async (req: Request, res: Response) => {
  try {
    const { nfc_id } = req.params;
    const normalizedNfcId = normalizeNfcId(nfc_id);
    
    if (!isValidNfcId(normalizedNfcId)) {
      return res.status(400).json({ error: '유효하지 않은 NFC ID 형식입니다.' });
    }
    
    const employee = await EmployeeModel.getByNfcId(normalizedNfcId);
    
    if (!employee) {
      return res.status(404).json({ error: 'NFC ID에 해당하는 직원을 찾을 수 없습니다.' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee by NFC ID:', error);
    res.status(500).json({ error: '직원 정보를 가져오는데 실패했습니다.' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { nfc_id, name, department, position, email, phone } = req.body;
    
    if (!nfc_id || !name) {
      return res.status(400).json({ error: 'NFC ID와 이름은 필수입니다.' });
    }
    
    // NFC ID 정규화
    const normalizedNfcId = normalizeNfcId(nfc_id);
    
    if (!isValidNfcId(normalizedNfcId)) {
      return res.status(400).json({ error: '유효하지 않은 NFC ID 형식입니다.' });
    }
    
    // Check if NFC ID already exists
    const existing = await EmployeeModel.getByNfcId(normalizedNfcId);
    if (existing) {
      return res.status(409).json({ error: '이미 등록된 NFC ID입니다.' });
    }
    
    const id = await EmployeeModel.create({
      nfc_id: normalizedNfcId,
      name,
      department,
      position,
      email,
      phone
    });
    
    const employee = await EmployeeModel.getById(id);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: '직원 등록에 실패했습니다.' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nfc_id, name, department, position, email, phone } = req.body;
    
    const employee = await EmployeeModel.getById(id);
    if (!employee) {
      return res.status(404).json({ error: '직원을 찾을 수 없습니다.' });
    }
    
    let normalizedNfcId = nfc_id;
    
    // Check if NFC ID is being changed and if it's already in use
    if (nfc_id && nfc_id !== employee.nfc_id) {
      normalizedNfcId = normalizeNfcId(nfc_id);
      
      if (!isValidNfcId(normalizedNfcId)) {
        return res.status(400).json({ error: '유효하지 않은 NFC ID 형식입니다.' });
      }
      
      const existing = await EmployeeModel.getByNfcId(normalizedNfcId);
      if (existing) {
        return res.status(409).json({ error: '이미 사용 중인 NFC ID입니다.' });
      }
    }
    
    const success = await EmployeeModel.update(id, {
      nfc_id: normalizedNfcId,
      name,
      department,
      position,
      email,
      phone
    });
    
    if (!success) {
      return res.status(400).json({ error: '업데이트할 내용이 없습니다.' });
    }
    
    const updatedEmployee = await EmployeeModel.getById(id);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: '직원 정보 수정에 실패했습니다.' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await EmployeeModel.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '직원을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '직원이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: '직원 삭제에 실패했습니다.' });
  }
};
