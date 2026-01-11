const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// 创建新项目
router.post('/', auth, projectController.createProject);

// 获取项目列表
router.get('/', auth, projectController.getProjects);

// 获取单个项目详情
router.get('/:id', auth, projectController.getProjectById);

// 更新项目
router.put('/:id', auth, projectController.updateProject);

// 删除项目
router.delete('/:id', auth, projectController.deleteProject);

// 批量删除项目
router.post('/batch-delete', auth, projectController.batchDeleteProjects);

// 更新项目状态
router.put('/:id/status', auth, projectController.updateProjectStatus);

module.exports = router;