const Personnel = require('../models/Personnel');
const Project = require('../models/Project');

// 创建人员记录
exports.createPersonnel = async (req, res) => {
  try {
    const personnel = new Personnel(req.body);
    await personnel.save();
    res.status(201).json(personnel);
  } catch (error) {
    res.status(500).json({ error: '创建人员记录失败，请重试' });
  }
};

// 批量创建人员记录
exports.batchCreatePersonnel = async (req, res) => {
  try {
    console.log('接收到批量创建人员记录请求:', {
      recordsCount: req.body.length,
      userId: req.user.id,
      userRole: req.user.role
    });
    
    // 为每个人员记录添加createdBy字段
    const personnelRecords = req.body.map(record => ({
      ...record,
      createdBy: req.user.id
    }));
    
    console.log('处理后的人员记录:', personnelRecords);
    
    const createdRecords = await Personnel.insertMany(personnelRecords);
    console.log('批量创建人员记录成功:', { count: createdRecords.length });
    res.status(201).json(createdRecords);
  } catch (error) {
    console.error('批量创建人员记录失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '批量创建人员记录失败', details: error.message });
  }
};

// 获取人员记录列表
exports.getPersonnel = async (req, res) => {
  try {
    let personnel;
    
    // 管理员可以查看所有人员记录，普通用户只能查看自己创建的记录
    if (req.user.role === '管理员') {
      personnel = await Personnel.find();
    } else {
      personnel = await Personnel.find({ createdBy: req.user.id });
    }
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: '获取人员记录列表失败' });
  }
};

// 获取项目相关的人员记录
exports.getPersonnelByProjectId = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    // 检查权限：管理员或项目创建者可以查看
    if (req.user.role !== '管理员' && project.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限访问' });
    }
    
    const personnel = await Personnel.find({ projectId: req.params.projectId });
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: '获取人员记录失败' });
  }
};

// 获取单个人员记录详情
exports.getPersonnelById = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({ error: '人员记录不存在' });
    }
    
    // 检查权限：管理员或记录创建者可以查看
    if (req.user.role !== '管理员' && personnel.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限访问' });
    }
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: '获取人员记录详情失败' });
  }
};

// 更新人员记录
exports.updatePersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({ error: '人员记录不存在' });
    }
    
    // 检查权限：管理员或记录创建者可以更新
    if (req.user.role !== '管理员' && personnel.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限操作' });
    }
    
    // 检查关联项目状态
    const project = await Project.findById(personnel.projectId);
    if (project && project.status === '已完成') {
      return res.status(400).json({ error: '已完成项目的人员记录不可修改' });
    }
    
    // 更新人员记录
    Object.assign(personnel, req.body);
    await personnel.save();
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: '更新人员记录失败' });
  }
};

// 删除人员记录
exports.deletePersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({ error: '人员记录不存在' });
    }
    
    // 检查权限：管理员或记录创建者可以删除
    if (req.user.role !== '管理员' && personnel.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限操作' });
    }
    
    // 检查关联项目状态
    const project = await Project.findById(personnel.projectId);
    if (project && project.status === '已完成') {
      return res.status(400).json({ error: '已完成项目的人员记录不可删除' });
    }
    
    await Personnel.findByIdAndDelete(req.params.id);
    res.json({ message: '人员记录删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除人员记录失败' });
  }
};

// 批量删除人员记录
exports.batchDeletePersonnel = async (req, res) => {
  try {
    const { ids } = req.body;
    
    // 检查权限：管理员或记录创建者可以删除
    if (req.user.role !== '管理员') {
      // 普通用户只能删除自己创建的记录
      const records = await Personnel.find({ _id: { $in: ids } });
      const canDelete = records.every(r => r.createdBy === req.user.id);
      if (!canDelete) {
        return res.status(403).json({ error: '无权限操作' });
      }
    }
    
    await Personnel.deleteMany({ _id: { $in: ids } });
    res.json({ message: '批量删除人员记录成功' });
  } catch (error) {
    res.status(500).json({ error: '批量删除人员记录失败' });
  }
};