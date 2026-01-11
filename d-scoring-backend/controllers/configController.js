const Config = require('../models/Config');

// 获取评分配置
exports.getScoringConfig = async (req, res) => {
  try {
    console.log('接收到获取评分配置请求');
    
    let config = await Config.findOne({ type: 'scoring' });
    console.log('查找评分配置结果:', config ? '找到配置' : '未找到配置');
    
    // 如果配置不存在，创建默认配置
    if (!config) {
      console.log('配置不存在，创建默认配置');
      config = new Config({
        type: 'scoring',
        cmf: [
          { label: '有品类视觉指导', value: 0.5 },
          { label: '无品类视觉指导', value: 1.0 }
        ],
        cmfp: [
          { mode: 'additional', main: 1.0, support: 0.5 },
          { mode: 'none', main: 1.5, support: 0 }
        ],
        base4: [
          { label: '+1.0', value: 1.0 },
          { label: '+1.5', value: 1.5 }
        ],
        base5: [
          { label: '+1.5', value: 1.5 },
          { label: '+2.0', value: 2.0 }
        ],
        addons: [
          { id: 'light_illu', label: '轻量化插画制作', score: 0.5 },
          { id: 'medium_illu', label: '中量化插画制作', score: 1.0 },
          { id: 'high_illu', label: '高量化插画制作', score: 2.0 },
          { id: 'light_struct', label: '轻量化结构', score: 0.5 },
          { id: 'medium_struct', label: '中量化结构', score: 1.0 }
        ],
        package: [
          { type: '基础型包装', score: 0.5 },
          { type: '微创新型包装', score: 1.0 },
          { type: '创新型包装', score: 2.0 }
        ],
        manual: [
          { type: '轻量化说明书内容制作', score: 0.2 },
          { type: '中量化说明书内容制作', score: 0.4 },
          { type: '原创性说明书内容制作', score: 1.0 }
        ]
      });
      
      console.log('保存默认配置');
      await config.save();
      console.log('保存默认配置成功');
    }
    
    console.log('获取评分配置成功:', config);
    res.json(config);
  } catch (error) {
    console.error('获取评分配置失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取评分配置失败', details: error.message });
  }
};

// 更新评分配置
exports.updateScoringConfig = async (req, res) => {
  try {
    // 只有管理员可以更新评分配置
    if (req.user.role !== '管理员') {
      return res.status(403).json({ error: '无权限操作' });
    }
    
    let config = await Config.findOne({ type: 'scoring' });
    
    if (!config) {
      config = new Config({ type: 'scoring', ...req.body });
    } else {
      Object.assign(config, req.body);
    }
    
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: '更新评分配置失败' });
  }
};