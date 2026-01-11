const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');
const auth = require('../middleware/auth');

// 创建人员记录
router.post('/', auth, personnelController.createPersonnel);

// 批量创建人员记录
router.post('/batch', auth, personnelController.batchCreatePersonnel);

// 获取人员记录列表
router.get('/', auth, personnelController.getPersonnel);

// 获取项目相关的人员记录
router.get('/project/:projectId', auth, personnelController.getPersonnelByProjectId);

// 获取单个人员记录详情
router.get('/:id', auth, personnelController.getPersonnelById);

// 更新人员记录
router.put('/:id', auth, personnelController.updatePersonnel);

// 删除人员记录
router.delete('/:id', auth, personnelController.deletePersonnel);

// 批量删除人员记录
router.post('/batch-delete', auth, personnelController.batchDeletePersonnel);

module.exports = router;