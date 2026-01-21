
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutGrid, 
  Package, 
  BookOpen, 
  PlusCircle, 
  BarChart2, 
  ShieldCheck, 
  Monitor, 
  Layout, 
  Users, 
  XCircle, 
  Settings,
  Clock,
  LogOut,
  Shield,
  User as UserIcon,
  Lock,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { 
  DesignProjectType, 
  PackageProjectType, 
  ManualProjectType, 
  ProjectRecord, 
  PersonnelRecord, 
  ProjectStatus, 
  ScoringConfig,
  User,
  UserRole
} from './types';
import { INITIAL_SCORING_CONFIG } from './constants';
import RecordsDashboard from './components/RecordsDashboard';
import ScorePreview from './components/ScorePreview';
import PersonnelLeaderboard from './components/PersonnelLeaderboard';
import ScoringSettings from './components/ScoringSettings';
import TeamManagement from './components/TeamManagement';
import AuthView from './components/AuthView';
import { authAPI, projectAPI, personnelAPI, configAPI } from './src/services/api';

const App: React.FC = () => {
  // --- Auth & User State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Navigation ---
  const [activeTab, setActiveTab] = useState<'input' | 'records' | 'settings' | 'team'>('input');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // --- Form States ---
  const [selectedDesignType, setSelectedDesignType] = useState<DesignProjectType | null>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<PackageProjectType | null>(null);
  const [selectedManualType, setSelectedManualType] = useState<ManualProjectType | null>(null);
  const [projectName, setProjectName] = useState('');
  
  const [cmfValue, setCmfValue] = useState<number>(0.5);
  const [cmfPerson, setCmfPerson] = useState('');
  const [cmfWorkDays, setCmfWorkDays] = useState<number>(0);
  
  const [cmfpMode, setCmfpMode] = useState<'additional' | 'none'>('additional');
  const [cmfpPerson1, setCmfpPerson1] = useState('');
  const [cmfpMainWorkDays, setCmfpMainWorkDays] = useState<number>(0);
  const [cmfpPerson2, setCmfpPerson2] = useState('');
  const [cmfpSupportWorkDays, setCmfpSupportWorkDays] = useState<number>(0);
  
  const [mainCreator, setMainCreator] = useState('');
  const [designBaseWorkDays, setDesignBaseWorkDays] = useState<number>(0);
  const [isIndependent, setIsIndependent] = useState<'yes' | 'no'>('yes');
  const [baseScore, setBaseScore] = useState<number>(1.0);
  
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonPersons, setAddonPersons] = useState<Record<string, string>>({});
  const [addonWorkDays, setAddonWorkDays] = useState<Record<string, number>>({});

  const [packagePerson, setPackagePerson] = useState('');
  const [packageWorkDays, setPackageWorkDays] = useState<number>(0);
  const [manualPerson, setManualPerson] = useState('');
  const [manualWorkDays, setManualWorkDays] = useState<number>(0);

  // --- Storage ---
  const [projectRecords, setProjectRecords] = useState<ProjectRecord[]>([]);
  const [personnelRecords, setPersonnelRecords] = useState<PersonnelRecord[]>([]);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(INITIAL_SCORING_CONFIG);

  // --- 数据加载函数 ---  
  const loadData = async () => {
    const token = localStorage.getItem('token');
    console.log('开始加载数据:', {
      token: token ? '存在' : '不存在'
    });
    
    if (!token) {
      console.log('没有令牌，无法加载数据');
      return;
    }
    
    try {
      // 1. 获取当前用户信息
      console.log('正在获取当前用户信息...');
      const userResponse = await authAPI.getMe();
      console.log('获取当前用户信息成功:', userResponse.data);
      setCurrentUser(userResponse.data);
      
      // 2. 获取项目列表
      console.log('正在获取项目列表...');
      try {
        const projectsResponse = await projectAPI.getList();
        console.log('获取项目列表成功:', {
          count: projectsResponse.data.length
        });
        setProjectRecords(projectsResponse.data);
      } catch (error: any) {
        console.error('获取项目列表失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      
      // 3. 获取人员记录列表
      console.log('正在获取人员记录列表...');
      try {
        const personnelResponse = await personnelAPI.getList();
        console.log('获取人员记录列表成功:', {
          count: personnelResponse.data.length
        });
        setPersonnelRecords(personnelResponse.data);
      } catch (error: any) {
        console.error('获取人员记录列表失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      
      // 4. 获取评分配置
      console.log('正在获取评分配置...');
      try {
        const configResponse = await configAPI.getScoringConfig();
        console.log('获取评分配置成功:', configResponse.data);
        setScoringConfig(configResponse.data);
      } catch (error: any) {
        console.error('获取评分配置失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      
      // 5. 如果是管理员，获取用户列表
      if (userResponse.data.role === '管理员') {
        console.log('正在获取用户列表...');
        try {
          const usersResponse = await authAPI.getUsers();
          console.log('获取用户列表成功:', {
            count: usersResponse.data.length
          });
          setUsers(usersResponse.data);
        } catch (error: any) {
          console.error('获取用户列表失败:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
        }
      }
      
      console.log('数据加载完成');
    } catch (error: any) {
      console.error('加载数据失败:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // 令牌无效，清除本地存储
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
  };

  // --- 初始化数据 ---  
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token');
      console.log('初始化数据开始:', {
        token: token ? '存在' : '不存在'
      });
      
      if (token) {
        await loadData();
      } else {
        console.log('没有令牌，跳过初始化数据');
      }
      
      setLoading(false);
    };

    initData();
  }, []);

  // --- Logic Helpers ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveTab('input');
    setProjectRecords([]);
    setPersonnelRecords([]);
    setUsers([]);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('确定要删除该项目及所有相关积分记录吗？')) return;
    try {
      await projectAPI.delete(id);
      setProjectRecords(prev => prev.filter(p => p.id !== id));
      setPersonnelRecords(prev => prev.filter(r => r.projectId !== id));
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const handleDeleteMultipleProjects = async (ids: string[]) => {
    if (!window.confirm(`确认批量删除选中的 ${ids.length} 个项目及其关联的积分明细吗？此操作不可逆。`)) return;
    try {
      await projectAPI.batchDelete(ids);
      setProjectRecords(prev => prev.filter(p => !ids.includes(p.id)));
      setPersonnelRecords(prev => prev.filter(r => !ids.includes(r.projectId)));
    } catch (error) {
      alert('批量删除失败，请重试');
    }
  };

  const handleUpdateScoringConfig = async (newConfig: ScoringConfig) => {
    try {
      const response = await configAPI.updateScoringConfig(newConfig);
      setScoringConfig(response.data);
      
      // 重新获取项目和人员记录，确保数据同步
      const projectsResponse = await projectAPI.getList();
      setProjectRecords(projectsResponse.data);
      
      const personnelResponse = await personnelAPI.getList();
      setPersonnelRecords(personnelResponse.data);
      
      alert('分值配置已同步至全系统及所有历史记录！');
    } catch (error) {
      alert('更新配置失败，请重试');
    }
  };

  const toggleUserStatus = async (userId: string) => {
    if (currentUser?.role !== '管理员') return;
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        const newStatus = user.status === '活跃' ? '停用' : '活跃';
        await authAPI.updateUserStatus({ id: userId, status: newStatus });
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            return { ...u, status: newStatus };
          }
          return u;
        }));
      }
    } catch (error) {
      alert('更新用户状态失败，请重试');
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    try {
      await projectAPI.updateStatus(id, status);
      // 重新获取项目列表，确保数据同步
      const projectsResponse = await projectAPI.getList();
      setProjectRecords(projectsResponse.data);
    } catch (error) {
      alert('更新项目状态失败，请重试');
    }
  };

  const generateId = (records: ProjectRecord[]) => {
    const ids = records
      .map(p => parseInt(p.id.replace('P', ''), 10))
      .filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = maxId + 1;
    return `P${nextId.toString().padStart(4, '0')}`;
  };

  const resetForm = () => {
    setSelectedDesignType(null); setSelectedPackageType(null); setSelectedManualType(null);
    setProjectName('');
    setSelectedAddons([]); setAddonPersons({}); setAddonWorkDays({});
    setCmfpPerson1(''); setCmfpPerson2(''); setCmfPerson(''); setMainCreator('');
    setPackagePerson(''); setManualPerson('');
    setCmfWorkDays(0); setCmfpMainWorkDays(0); setCmfpSupportWorkDays(0);
    setDesignBaseWorkDays(0); setPackageWorkDays(0); setManualWorkDays(0);
    setEditingProjectId(null);
  };

  const handleEditInit = (id: string) => {
    const project = projectRecords.find(p => p.id === id);
    if (!project) return;
    if (project.status === '已完成') return alert('已完成项目不可修改');
    
    const s = project.rawSelections;
    setSelectedDesignType(s.selectedDesignType);
    setSelectedPackageType(s.selectedPackageType);
    setSelectedManualType(s.selectedManualType);
    setProjectName(project.projectName || '');
    setCmfValue(s.cmfValue);
    setCmfPerson(s.cmfPerson);
    setCmfWorkDays(s.cmfWorkDays || 0);
    setCmfpMode(s.cmfpMode);
    setCmfpPerson1(s.cmfpPerson1);
    setCmfpMainWorkDays(s.cmfpMainWorkDays || 0);
    setCmfpPerson2(s.cmfpPerson2);
    setCmfpSupportWorkDays(s.cmfpSupportWorkDays || 0);
    setMainCreator(s.mainCreator);
    setDesignBaseWorkDays(s.designBaseWorkDays || 0);
    setIsIndependent(s.isIndependent);
    setBaseScore(s.baseScore);
    setSelectedAddons(s.selectedAddons || []);
    setAddonPersons(s.addonPersons || {});
    setAddonWorkDays(s.addonWorkDays || {});
    setPackagePerson(s.packagePerson);
    setPackageWorkDays(s.packageWorkDays || 0);
    setManualPerson(s.manualPerson);
    setManualWorkDays(s.manualWorkDays || 0);

    setEditingProjectId(id);
    setActiveTab('input');
  };

  const { currentScore, scoreDescription, scoringParts } = useMemo(() => {
    let score = 0;
    let desc = [];
    let parts: { label: string; value: number }[] = [];

    if (selectedDesignType) {
      if (selectedDesignType === DesignProjectType.THREE_SERIES_CMF) {
        score += cmfValue;
        const label = scoringConfig.cmf.find(c => c.value === cmfValue)?.label || 'CMF';
        desc.push(`${label}(${cmfValue})`);
        parts.push({ label, value: cmfValue });
      } else if (selectedDesignType === DesignProjectType.THREE_SERIES_CMFP) {
        const total = 1.5; 
        score += total;
        desc.push('CMFP(1.5)');
        parts.push({ label: 'CMFP', value: total });
      } else {
        let pScore = baseScore;
        parts.push({ label: '基础分', value: baseScore });
        selectedAddons.forEach(id => {
          const addon = scoringConfig.addons.find(a => a.id === id);
          if (addon) {
            pScore += addon.score;
            parts.push({ label: addon.label, value: addon.score });
          }
        });
        score += pScore;
        desc.push(`产品创新(${pScore})`);
      }
    }
    if (selectedPackageType) {
      const pScore = scoringConfig.package.find(p => p.type === selectedPackageType)?.score || 0;
      score += pScore;
      desc.push(`包装(${pScore})`);
      parts.push({ label: selectedPackageType, value: pScore });
    }
    if (selectedManualType) {
      const mScore = scoringConfig.manual.find(m => m.type === selectedManualType)?.score || 0;
      score += mScore;
      desc.push(`说明书(${mScore})`);
      parts.push({ label: selectedManualType, value: mScore });
    }
    return { currentScore: score, scoreDescription: desc.join(' + '), scoringParts: parts };
  }, [selectedDesignType, selectedPackageType, selectedManualType, cmfValue, baseScore, selectedAddons, scoringConfig]);

  const handleConfirm = async () => {
    if (!currentUser) return;
    if (!selectedDesignType && !selectedPackageType && !selectedManualType) return alert('请至少选择一个项目组成部分');
    if (!projectName.trim()) return alert('请输入项目名称');
    
    const newProjectId = editingProjectId || generateId(projectRecords);
    const now = new Date();
    const entryTime = now.toISOString().split('T')[0];
    const newPersRecords: PersonnelRecord[] = [];
    let contents: string[] = [];
    let totalDays = 0;

    if (selectedDesignType) {
      contents.push(selectedDesignType);
      if (selectedDesignType === DesignProjectType.THREE_SERIES_CMF) {
        newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: cmfPerson || '未命名', projectId: newProjectId, entryTime, score: cmfValue, content: selectedDesignType, workDays: cmfWorkDays, createdBy: currentUser.id });
        totalDays += cmfWorkDays;
      } else if (selectedDesignType === DesignProjectType.THREE_SERIES_CMFP) {
        const config = scoringConfig.cmfp.find(c => c.mode === cmfpMode);
        if (cmfpMode === 'additional') {
          newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: cmfpPerson1 || '主责人员', projectId: newProjectId, entryTime, score: config?.main || 1.0, content: selectedDesignType, workDays: cmfpMainWorkDays, createdBy: currentUser.id });
          newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: cmfpPerson2 || '支持人员', projectId: newProjectId, entryTime, score: config?.support || 0.5, content: selectedDesignType + ' (插画制作支持)', workDays: cmfpSupportWorkDays, createdBy: currentUser.id });
          totalDays += (cmfpMainWorkDays + cmfpSupportWorkDays);
        } else {
          newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: cmfpPerson1 || '主责人员', projectId: newProjectId, entryTime, score: config?.main || 1.5, content: selectedDesignType, workDays: cmfpMainWorkDays, createdBy: currentUser.id });
          totalDays += cmfpMainWorkDays;
        }
      } else {
        newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: mainCreator || '主创', projectId: newProjectId, entryTime, score: baseScore, content: selectedDesignType + ' (基础)', workDays: designBaseWorkDays, createdBy: currentUser.id });
        totalDays += designBaseWorkDays;
        selectedAddons.forEach(id => {
          const addon = scoringConfig.addons.find(a => a.id === id);
          if (addon) {
            const p = isIndependent === 'yes' ? mainCreator : (addonPersons[id] || '协作');
            const d = addonWorkDays[id] || 0;
            newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: p, projectId: newProjectId, entryTime, score: addon.score, content: selectedDesignType + ' (' + addon.label + ')', workDays: d, createdBy: currentUser.id });
            totalDays += d;
          }
        });
      }
    }

    if (selectedPackageType) {
      contents.push(selectedPackageType);
      const s = scoringConfig.package.find(p => p.type === selectedPackageType)?.score || 0;
      newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: packagePerson || '未命名', projectId: newProjectId, entryTime, score: s, content: selectedPackageType, workDays: packageWorkDays, createdBy: currentUser.id });
      totalDays += packageWorkDays;
    }

    if (selectedManualType) {
      contents.push(selectedManualType);
      const s = scoringConfig.manual.find(m => m.type === selectedManualType)?.score || 0;
      newPersRecords.push({ id: Math.random().toString(36).substring(2, 9), person: manualPerson || '未命名', projectId: newProjectId, entryTime, score: s, content: selectedManualType, workDays: manualWorkDays, createdBy: currentUser.id });
      totalDays += manualWorkDays;
    }

    const newProject: ProjectRecord = {
      id: newProjectId,
      type: selectedDesignType || '组合项',
      projectName: projectName.trim(),
      content: contents.join(' + '),
      entryTime,
      score: currentScore,
      responsiblePerson: mainCreator || cmfPerson || cmfpPerson1 || packagePerson || manualPerson || '多人',
      status: '进行中',
      scoringParts,
      totalWorkDays: totalDays,
      createdBy: currentUser.id,
      creatorName: currentUser.username,
      rawSelections: {
        selectedDesignType,
        selectedPackageType,
        selectedManualType,
        projectName: projectName.trim(),
        cmfValue,
        cmfPerson,
        cmfWorkDays,
        cmfpMode,
        cmfpPerson1,
        cmfpMainWorkDays,
        cmfpPerson2,
        cmfpSupportWorkDays,
        mainCreator,
        designBaseWorkDays,
        isIndependent,
        baseScore,
        selectedAddons,
        addonPersons,
        addonWorkDays,
        packagePerson,
        packageWorkDays,
        manualPerson,
        manualWorkDays
      }
    };

    try {
      if (editingProjectId) {
        // 更新项目
        await projectAPI.update(editingProjectId, newProject);
        // 删除旧的人员记录
        const oldPersRecords = personnelRecords.filter(r => r.projectId === editingProjectId);
        for (const record of oldPersRecords) {
          await personnelAPI.delete(record.id);
        }
        // 创建新的人员记录
        await personnelAPI.batchCreate(newPersRecords);
        // 重新获取数据
        const projectsResponse = await projectAPI.getList();
        setProjectRecords(projectsResponse.data);
        const personnelResponse = await personnelAPI.getList();
        setPersonnelRecords(personnelResponse.data);
        alert('项目更新成功！');
      } else {
        // 创建项目
        await projectAPI.create(newProject);
        // 创建人员记录
        await personnelAPI.batchCreate(newPersRecords);
        // 重新获取数据
        const projectsResponse = await projectAPI.getList();
        setProjectRecords(projectsResponse.data);
        const personnelResponse = await personnelAPI.getList();
        setPersonnelRecords(personnelResponse.data);
        alert('录入成功！');
      }

      resetForm();
      setActiveTab('records');
    } catch (error) {
      alert('操作失败，请重试');
    }
  };

  if (!loading && !currentUser) {
    return <AuthView setCurrentUser={setCurrentUser} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <div className="text-white text-lg font-bold">加载中...</div>
      </div>
    );
  }

  const isAdmin = currentUser.role === '管理员';

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 tech-card border-b border-white/5 px-6 py-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 tech-gradient rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Layout className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">D-Scoring Pro</span>
            <div className="flex items-center gap-1.5 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
               <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{currentUser.username} | {currentUser.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'input' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <Monitor className="w-4 h-4" /> 项目录入
            </button>
            <button 
              onClick={() => setActiveTab('records')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'records' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <BarChart2 className="w-4 h-4" /> 数据看板
            </button>
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  <Users className="w-4 h-4" /> 团队管理
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  <Settings className="w-4 h-4" /> 分数设置
                </button>
              </>
            )}
          </div>
          <button 
            onClick={handleLogout}
            title="退出登录"
            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {activeTab === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="lg:col-span-8 space-y-6">
              
              <section className="tech-card rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{editingProjectId ? `修改项目: ${editingProjectId}` : '设计项目录入'}</h2>
                  </div>
                  {editingProjectId && (
                    <button onClick={resetForm} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs">
                      <XCircle className="w-4 h-4" /> 取消修改
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {Object.values(DesignProjectType).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedDesignType(selectedDesignType === type ? null : type)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${selectedDesignType === type ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {selectedDesignType && (
                  <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/50 space-y-6">
                    {selectedDesignType === DesignProjectType.THREE_SERIES_CMF && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-500 uppercase">选择视觉指导</label>
                           <div className="flex flex-col gap-2">
                             {scoringConfig.cmf.map(o => (
                               <button key={o.value} onClick={() => setCmfValue(o.value)} className={`p-3 text-left rounded-xl border text-sm transition-all ${cmfValue === o.value ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                 {o.label} (+{o.value})
                               </button>
                             ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">负责人</label>
                              <input value={cmfPerson} onChange={e => setCmfPerson(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-white" placeholder="输入负责人姓名" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 工作天数
                              </label>
                              <input type="number" step="0.5" min="0" value={cmfWorkDays} onChange={e => setCmfWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-xl px-4 py-2 text-white font-mono" placeholder="0.5 的倍数" />
                           </div>
                        </div>
                      </div>
                    )}

                    {selectedDesignType === DesignProjectType.THREE_SERIES_CMFP && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-xs font-bold text-slate-500 uppercase">选择项</label>
                           <div className="flex flex-col gap-2">
                             <button 
                               onClick={() => setCmfpMode('additional')} 
                               className={`p-4 text-left rounded-xl border text-sm transition-all ${cmfpMode === 'additional' ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                             >
                               有额外轻量化插画制作支持
                             </button>
                             <button 
                               onClick={() => setCmfpMode('none')} 
                               className={`p-4 text-left rounded-xl border text-sm transition-all ${cmfpMode === 'none' ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                             >
                               无额外轻量化插画制作支持
                             </button>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                 <div>
                                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                                     主负责人 ({cmfpMode === 'additional' ? `+${scoringConfig.cmfp[0].main}` : `+${scoringConfig.cmfp[1].main}`})
                                   </label>
                                   <input value={cmfpPerson1} onChange={e => setCmfpPerson1(e.target.value)} className="w-full glass-input rounded-lg px-3 py-2 text-white text-xs" placeholder="姓名" />
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                                     <Clock className="w-2.5 h-2.5" /> 主创天数
                                   </label>
                                   <input type="number" step="0.5" min="0" value={cmfpMainWorkDays} onChange={e => setCmfpMainWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-lg px-3 py-2 text-white text-xs font-mono" placeholder="天数" />
                                 </div>
                              </div>
                           </div>

                           {cmfpMode === 'additional' && (
                             <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 gap-3">
                                   <div>
                                     <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block">
                                       支持负责人 (插画制作) (+{scoringConfig.cmfp[0].support})
                                     </label>
                                     <input value={cmfpPerson2} onChange={e => setCmfpPerson2(e.target.value)} className="w-full glass-input rounded-lg px-3 py-2 text-white text-xs border-indigo-500/30" placeholder="姓名" />
                                   </div>
                                   <div>
                                     <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block flex items-center gap-1">
                                       <Clock className="w-2.5 h-2.5" /> 支持天数
                                     </label>
                                     <input type="number" step="0.5" min="0" value={cmfpSupportWorkDays} onChange={e => setCmfpSupportWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-lg px-3 py-2 text-white text-xs font-mono" placeholder="天数" />
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    )}

                    {(selectedDesignType === DesignProjectType.FOUR_SERIES_INNOVATION || selectedDesignType === DesignProjectType.FIVE_SERIES_INNOVATION) && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">主创人员</label>
                            <input value={mainCreator} onChange={e => setMainCreator(e.target.value)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white" placeholder="姓名" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> 基础天数</label>
                            <input type="number" step="0.5" min="0" value={designBaseWorkDays} onChange={e => setDesignBaseWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white font-mono" placeholder="天数" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">基础分</label>
                            <div className="flex gap-1">
                               {(selectedDesignType === DesignProjectType.FOUR_SERIES_INNOVATION ? scoringConfig.base4 : scoringConfig.base5).map(b => (
                                 <button key={b.value} onClick={() => setBaseScore(b.value)} className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${baseScore === b.value ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                   {b.label}
                                 </button>
                               ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">独立完成</label>
                            <div className="flex gap-1">
                               <button onClick={() => setIsIndependent('yes')} className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${isIndependent === 'yes' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>是</button>
                               <button onClick={() => setIsIndependent('no')} className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${isIndependent === 'no' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>否</button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">额外加分项录入</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scoringConfig.addons.map(a => (
                              <div key={a.id} className={`p-4 rounded-xl border transition-all space-y-3 ${selectedAddons.includes(a.id) ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}>
                                <button 
                                  onClick={() => setSelectedAddons(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                                  className={`w-full text-left flex justify-between items-center`}
                                >
                                  <span className={`text-xs font-bold ${selectedAddons.includes(a.id) ? 'text-white' : 'text-slate-500'}`}>{a.label} (+{a.score})</span>
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAddons.includes(a.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700'}`}>
                                    {selectedAddons.includes(a.id) && <div className="w-2 h-2 bg-white rounded-full shadow-inner" />}
                                  </div>
                                </button>
                                {selectedAddons.includes(a.id) && (
                                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                      <label className="text-[10px] text-slate-500 mb-1 block">人员</label>
                                      <input 
                                        className="w-full glass-input rounded-lg px-2 py-1.5 text-xs text-white"
                                        placeholder={isIndependent === 'yes' ? mainCreator : "姓名"}
                                        disabled={isIndependent === 'yes'}
                                        value={isIndependent === 'yes' ? mainCreator : (addonPersons[a.id] || '')}
                                        onChange={(e) => setAddonPersons({...addonPersons, [a.id]: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-500 mb-1 block flex items-center gap-1"><Clock className="w-2 h-2"/> 天数</label>
                                      <input 
                                        type="number" step="0.5" min="0"
                                        className="w-full glass-input rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                                        value={addonWorkDays[a.id] || 0}
                                        onChange={(e) => setAddonWorkDays({...addonWorkDays, [a.id]: parseFloat(e.target.value) || 0})}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="tech-card rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">包装项目</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                     {scoringConfig.package.map(t => (
                        <button key={t.type} onClick={() => setSelectedPackageType(selectedPackageType === t.type ? null : t.type)} className={`p-3 text-left rounded-xl border text-xs font-bold transition-all ${selectedPackageType === t.type ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{t.type} (+{t.score})</button>
                     ))}
                  </div>
                  {selectedPackageType && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-xl border border-white/5 animate-in slide-in-from-bottom-2">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">负责人</label>
                        <input value={packagePerson} onChange={e => setPackagePerson(e.target.value)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white" placeholder="姓名" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> 天数</label>
                        <input type="number" step="0.5" min="0" value={packageWorkDays} onChange={e => setPackageWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white font-mono" />
                      </div>
                    </div>
                  )}
                </section>

                <section className="tech-card rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">说明书项目</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                     {scoringConfig.manual.map(t => (
                        <button key={t.type} onClick={() => setSelectedManualType(selectedManualType === t.type ? null : t.type)} className={`p-3 text-left rounded-xl border text-xs font-bold transition-all ${selectedManualType === t.type ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{t.type.slice(0, 3)} (+{t.score})</button>
                     ))}
                  </div>
                  {selectedManualType && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-xl border border-white/5 animate-in slide-in-from-bottom-2">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">负责人</label>
                        <input value={manualPerson} onChange={e => setManualPerson(e.target.value)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white" placeholder="姓名" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> 天数</label>
                        <input type="number" step="0.5" min="0" value={manualWorkDays} onChange={e => setManualWorkDays(parseFloat(e.target.value) || 0)} className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white font-mono" />
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <ScorePreview score={currentScore} description={scoreDescription} />
            </div>

            <div className="lg:col-span-4 space-y-6 sticky top-28">
               <section className="tech-card rounded-[2rem] p-8 bg-indigo-600/5 border-indigo-500/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">录入检查</h2>
                  </div>
                  <div className="space-y-4 mb-8">
                     <div className="p-3 bg-slate-900/40 rounded-xl space-y-2">
                        <label className="text-slate-500 text-xs font-bold block mb-2">项目名称</label>
                        <input 
                          type="text" 
                          value={projectName}
                          onChange={e => setProjectName(e.target.value)}
                          className="w-full glass-input rounded-xl px-4 py-3 text-white"
                          placeholder="请输入项目名称（必填）"
                          required
                        />
                     </div>
                     <div className="flex justify-between p-3 bg-slate-900/40 rounded-xl">
                        <span className="text-slate-500 text-xs font-bold">已选组成部分</span>
                        <span className="text-white font-mono text-xs">{(selectedDesignType?1:0)+(selectedPackageType?1:0)+(selectedManualType?1:0)} 项</span>
                     </div>
                     <div className="flex justify-between p-3 bg-slate-900/40 rounded-xl">
                        <span className="text-slate-500 text-xs font-bold">累计工作天数</span>
                        <span className="text-cyan-400 font-mono text-xs font-bold">
                          {(
                            (selectedDesignType ? (
                              selectedDesignType === DesignProjectType.THREE_SERIES_CMF ? cmfWorkDays :
                              selectedDesignType === DesignProjectType.THREE_SERIES_CMFP ? (cmfpMainWorkDays + (cmfpMode === 'additional' ? cmfpSupportWorkDays : 0)) :
                              (designBaseWorkDays + selectedAddons.reduce((acc, id) => acc + (addonWorkDays[id] || 0), 0))
                            ) : 0) + 
                            (selectedPackageType ? packageWorkDays : 0) + 
                            (selectedManualType ? manualWorkDays : 0)
                          ).toFixed(1)} 天
                        </span>
                     </div>
                     <div className="flex justify-between p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <span className="text-slate-200 text-xs font-black uppercase tracking-wider">预估积分汇总</span>
                        <span className="text-indigo-400 font-mono text-2xl font-black">{currentScore.toFixed(2)}</span>
                     </div>
                  </div>
                  <button 
                    onClick={handleConfirm}
                    disabled={currentScore === 0}
                    className="w-full py-4 rounded-2xl tech-gradient text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" /> {editingProjectId ? '确认修改并保存' : '存入数据档案库'}
                  </button>
               </section>
            </div>
          </div>
        ) : activeTab === 'records' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">数据明细档案</h2>
                </div>
                <button 
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新数据
                </button>
              </div>
              <RecordsDashboard 
                currentUser={currentUser}
                projectRecords={projectRecords} 
                personnelRecords={personnelRecords} 
                onDeleteProject={handleDeleteProject}
                onDeleteMultipleProjects={handleDeleteMultipleProjects}
                onEditProject={handleEditInit}
                onUpdateProjectStatus={handleUpdateProjectStatus}
              />
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">积分表现可视化</h2>
              </div>
              <PersonnelLeaderboard 
                currentUser={currentUser}
                records={personnelRecords} 
                projectRecords={projectRecords} 
              />
            </section>
          </div>
        ) : activeTab === 'team' ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
             <TeamManagement 
              users={users} 
              onToggleStatus={toggleUserStatus}
              currentUserId={currentUser.id}
             />
           </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            <ScoringSettings config={scoringConfig} onSave={handleUpdateScoringConfig} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
