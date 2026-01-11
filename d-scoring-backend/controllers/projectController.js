const Project = require('../models/Project');
const Personnel = require('../models/Personnel');

// 创建新项目
exports.createProject = async (req, res) => {
  try {
    console.log('接收到创建项目请求:', {
      projectData: req.body,
      userId: req.user.id,
      userRole: req.user.role
    });
    
    // 准备项目数据，确保必填字段完整
    const projectData = {
      ...req.body,
      // 确保createdBy字段存在，使用当前用户ID
      createdBy: req.user.id,
      // 确保creatorName字段存在
      creatorName: req.body.creatorName || req.user.username
    };
    
    // 验证并修正项目ID格式
    let projectId = projectData.id;
    if (!projectId || !/^P\d{4}$/.test(projectId)) {
      console.log('项目ID格式不正确，重新生成:', projectId);
      
      // 尝试获取当前最大的项目ID
      try {
        const maxProject = await Project.findOne({}, { id: 1 }).sort({ id: -1 });
        let maxId = 0;
        
        if (maxProject && maxProject.id) {
          // 提取数字部分
          const idNum = parseInt(maxProject.id.replace('P', ''), 10);
          if (!isNaN(idNum)) {
            maxId = idNum;
          }
        }
        
        // 生成新的四位数字ID
        const nextId = maxId + 1;
        projectId = `P${nextId.toString().padStart(4, '0')}`;
        console.log('生成新ID:', projectId);
      } catch (idError) {
        // 如果获取最大ID失败，使用随机四位数字
        const randomId = Math.floor(1000 + Math.random() * 9000); // 1000-9999
        projectId = `P${randomId.toString().padStart(4, '0')}`;
        console.log('生成随机ID:', projectId);
      }
    } else {
      console.log('项目ID格式正确:', projectId);
    }
    
    // 更新项目ID
    projectData.id = projectId;
    
    let project = new Project(projectData);
    let savedProject;
    let retryCount = 0;
    const maxRetries = 10;
    
    while (retryCount < maxRetries) {
      try {
        savedProject = await project.save();
        break; // 保存成功，退出循环
      } catch (error) {
        // 检查是否是唯一键冲突错误
        if (error.code === 11000 && error.keyPattern && error.keyPattern.id) {
          console.log('项目ID已存在，尝试生成新ID:', project.id);
          
          // 尝试获取当前最大的项目ID
          try {
            const maxProject = await Project.findOne({}, { id: 1 }).sort({ id: -1 });
            let maxId = 0;
            
            if (maxProject && maxProject.id) {
              // 提取数字部分
              const idNum = parseInt(maxProject.id.replace('P', ''), 10);
              if (!isNaN(idNum)) {
                maxId = idNum;
              }
            }
            
            // 生成新的四位数字ID
            const nextId = maxId + 1;
            const newId = `P${nextId.toString().padStart(4, '0')}`;
            project.id = newId;
            console.log('生成新ID:', newId);
          } catch (idError) {
            // 如果获取最大ID失败，使用随机四位数字
            const randomId = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            const newId = `P${randomId.toString().padStart(4, '0')}`;
            project.id = newId;
            console.log('生成随机ID:', newId);
          }
          
          retryCount++;
        } else {
          // 其他错误，直接抛出
          throw error;
        }
      }
    }
    
    if (!savedProject) {
      throw new Error('尝试多次后仍无法创建项目，请稍后重试');
    }
    
    console.log('创建项目成功:', savedProject);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('创建项目失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '创建项目失败，请重试', details: error.message });
  }
};

// 获取项目列表
exports.getProjects = async (req, res) => {
  try {
    console.log('接收到获取项目列表请求:', {
      userId: req.user.id,
      userIdType: typeof req.user.id,
      userRole: req.user.role,
      headers: req.headers,
      query: req.query
    });
    
    let projects;
    
    try {
      // 管理员可以查看所有项目，普通用户只能查看自己创建的项目
      if (req.user.role === '管理员') {
        console.log('管理员获取所有项目');
        projects = await Project.find();
      } else {
        // 确保比较时类型一致
        const userId = req.user.id.toString();
        console.log('普通用户获取项目列表:', {
          userId,
          userIdType: typeof userId
        });
        projects = await Project.find({ createdBy: userId });
      }
      
      console.log('获取项目列表成功:', { count: projects.length });
      res.json(projects);
    } catch (error) {
      console.error('查询项目列表失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({ error: '查询项目列表失败', details: error.message });
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取项目列表失败', details: error.message });
  }
};

// 获取单个项目详情
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    // 检查权限：管理员或项目创建者可以查看
    if (req.user.role !== '管理员' && project.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限访问' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '获取项目详情失败' });
  }
};

// 更新项目
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    // 检查权限：管理员或项目创建者可以更新
    if (req.user.role !== '管理员' && project.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限操作' });
    }
    
    // 已完成的项目不能修改
    if (project.status === '已完成') {
      return res.status(400).json({ error: '已完成项目不可修改' });
    }
    
    // 更新项目信息
    Object.assign(project, req.body);
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' });
  }
};

// 删除项目
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    // 检查权限：管理员或项目创建者可以删除
    if (req.user.role !== '管理员' && project.createdBy !== req.user.id) {
      return res.status(403).json({ error: '无权限操作' });
    }
    
    // 删除项目及其关联的人员记录
    await Project.deleteOne({ id: req.params.id });
    await Personnel.deleteMany({ projectId: req.params.id });
    
    res.json({ message: '项目删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除项目失败' });
  }
};

// 批量删除项目
exports.batchDeleteProjects = async (req, res) => {
  try {
    const { ids } = req.body;
    
    // 检查权限：管理员或项目创建者可以删除
    if (req.user.role !== '管理员') {
      // 普通用户只能删除自己创建的项目
      const projects = await Project.find({ id: { $in: ids } });
      const canDelete = projects.every(p => p.createdBy === req.user.id);
      if (!canDelete) {
        return res.status(403).json({ error: '无权限操作' });
      }
    }
    
    // 删除项目及其关联的人员记录
    await Project.deleteMany({ id: { $in: ids } });
    await Personnel.deleteMany({ projectId: { $in: ids } });
    
    res.json({ message: '批量删除项目成功' });
  } catch (error) {
    console.error('批量删除项目失败:', error);
    res.status(500).json({ error: '批量删除项目失败' });
  }
};

// 更新项目状态
exports.updateProjectStatus = async (req, res) => {
  try {
    console.log('接收到更新项目状态请求:', {
      projectId: req.params.id,
      status: req.body.status,
      userId: req.user.id,
      userIdType: typeof req.user.id,
      userRole: req.user.role
    });
    
    // 使用自定义id字段查找项目，而不是_id
    const project = await Project.findOne({ id: req.params.id });
    
    console.log('查找项目结果:', project ? '找到项目' : '未找到项目');
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    console.log('项目信息:', {
      projectId: project.id,
      createdBy: project.createdBy,
      createdByType: typeof project.createdBy,
      currentStatus: project.status
    });
    
    // 检查权限：管理员或项目创建者可以更新
    const isAdmin = req.user.role === '管理员';
    const isCreator = project.createdBy === req.user.id;
    console.log('权限检查信息:', {
      isAdmin,
      isCreator,
      projectCreatedBy: project.createdBy,
      currentUserId: req.user.id,
      userRole: req.user.role
    });
    
    if (!isAdmin && !isCreator) {
      console.log('权限检查失败');
      return res.status(403).json({ error: '无权限操作' });
    }
    
    console.log('权限检查通过，准备更新状态:', {
      oldStatus: project.status,
      newStatus: req.body.status
    });
    
    // 更新项目状态
    project.status = req.body.status;
    console.log('保存前的项目对象:', project);
    const updatedProject = await project.save();
    
    console.log('项目状态更新成功:', updatedProject);
    
    res.json(updatedProject);
  } catch (error) {
    console.error('更新项目状态失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '更新项目状态失败' });
  }
};