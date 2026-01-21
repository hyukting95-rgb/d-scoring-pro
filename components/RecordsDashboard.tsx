
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  Clock,
  UserCheck,
  Star,
  Activity,
  ClipboardList,
  Calendar,
  Hash,
  ShieldAlert,
  User as UserIcon,
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import { ProjectRecord, PersonnelRecord, ProjectStatus, User } from '../types';
import * as XLSX from 'https://esm.sh/xlsx';

interface Props {
  currentUser: User;
  projectRecords: ProjectRecord[];
  personnelRecords: PersonnelRecord[];
  onDeleteProject: (id: string) => void;
  onDeleteMultipleProjects: (ids: string[]) => void;
  onEditProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
}

const RecordsDashboard: React.FC<Props> = ({ 
  currentUser,
  projectRecords, 
  personnelRecords, 
  onDeleteProject,
  onDeleteMultipleProjects,
  onEditProject,
  onUpdateProjectStatus,
}) => {
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isAdmin = currentUser.role === '管理员';

  // 数据过滤核心逻辑：管理员看全局，普通用户看自己
  const visibleProjects = useMemo(() => 
    projectRecords.filter(p => isAdmin || p.createdBy === currentUser.id),
  [projectRecords, isAdmin, currentUser.id]);

  const visiblePersonnel = useMemo(() => 
    personnelRecords.filter(r => isAdmin || r.createdBy === currentUser.id),
  [personnelRecords, isAdmin, currentUser.id]);

  const filteredProjects = useMemo(() => 
    visibleProjects.filter(p => p.id.toLowerCase().includes(search.toLowerCase()) || p.content.includes(search)),
  [visibleProjects, search]);

  const filteredPersonnel = useMemo(() => 
    visiblePersonnel.filter(r => r.person.includes(search) || r.content.includes(search) || r.projectId.toLowerCase().includes(search.toLowerCase())),
  [visiblePersonnel, search]);

  const summaryData = useMemo(() => {
    const summaryMap: Record<string, { 
      person: string, 
      completedUids: Set<string>, 
      inProgressUids: Set<string>, 
      points: number,
      totalWorkDays: number
    }> = {};

    visiblePersonnel.forEach(r => {
      if (!summaryMap[r.person]) {
        summaryMap[r.person] = { person: r.person, completedUids: new Set(), inProgressUids: new Set(), points: 0, totalWorkDays: 0 };
      }
      const project = projectRecords.find(p => p.id === r.projectId);
      if (project) {
        if (project.status === '已完成') {
          summaryMap[r.person].completedUids.add(r.projectId);
          summaryMap[r.person].points += r.score;
          summaryMap[r.person].totalWorkDays += r.workDays;
        } else {
          summaryMap[r.person].inProgressUids.add(r.projectId);
        }
      }
    });

    return Object.values(summaryMap).map(s => ({
      ...s,
      completed: s.completedUids.size,
      inProgress: s.inProgressUids.size,
      participated: new Set([...s.completedUids, ...s.inProgressUids]).size
    })).sort((a, b) => b.points - a.points);
  }, [visiblePersonnel, projectRecords]);

  // 全选处理
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map(p => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    onDeleteMultipleProjects(selectedIds);
    setSelectedIds([]);
  };

  // 管理员导出 Excel 逻辑
  const handleExportExcel = () => {
    if (!isAdmin) return;
    setIsExporting(true);

    try {
      const projectsSheet = filteredProjects.map(p => ({
        '项目UID': p.id,
        '项目类型': p.type,
        '组成明细': p.content,
        '录入者': p.creatorName,
        '总工天汇总': p.totalWorkDays,
        '预估总分': p.score,
        '录入日期': p.entryTime,
        '当前状态': p.status
      }));

      const pointsSheet = filteredPersonnel.map(r => ({
        '获得者': r.person,
        '关联UID': r.projectId,
        '得分内容': r.content,
        '个人工天': r.workDays,
        '分值': r.score,
        '结算日期': r.entryTime
      }));

      const summarySheet = summaryData.map(s => ({
        '姓名': s.person,
        '总投入工天': s.totalWorkDays,
        '已完成项目数': s.completed,
        '进行中项目数': s.inProgress,
        '累计结算积分': s.points
      }));

      const wb = XLSX.utils.book_new();
      const wsProjects = XLSX.utils.json_to_sheet(projectsSheet);
      const wsPoints = XLSX.utils.json_to_sheet(pointsSheet);
      const wsSummary = XLSX.utils.json_to_sheet(summarySheet);

      XLSX.utils.book_append_sheet(wb, wsProjects, "项目档案库");
      XLSX.utils.book_append_sheet(wb, wsPoints, "积分明细流");
      XLSX.utils.book_append_sheet(wb, wsSummary, "绩效表现汇总");

      const fileName = `D-Scoring_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12 relative">
      {/* 批量操作浮动栏 */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="tech-card px-8 py-4 rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center gap-8 bg-slate-900/90 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-xs">
                {selectedIds.length}
              </div>
              <span className="text-white text-sm font-bold">已选择项目</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white text-xs font-bold transition-colors"
              >
                取消选择
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> 批量删除所选
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
           {isAdmin ? (
             <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20 shadow-lg">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">全局管理视图 (可见所有录入)</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">个人录入视图 (仅本人可见)</span>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input rounded-2xl pl-12 pr-6 py-3 text-sm w-full outline-none" 
              placeholder="在权限范围内搜索..." 
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${isExporting ? 'bg-slate-800 text-slate-500 border-slate-700' : 'tech-gradient text-white border-white/10 shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'}`}
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              {isExporting ? '导出中...' : '导出报表'}
            </button>
          )}
        </div>
      </div>

      {/* 1. 项目明细库 */}
      <div className="tech-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="px-8 py-6 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">项目明细库</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-[10px] text-slate-600 font-mono">COUNT: {filteredProjects.length}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-5 w-10">
                  <button 
                    onClick={handleSelectAll}
                    className="p-1 rounded bg-slate-800 border border-white/5 text-indigo-400 hover:scale-110 transition-transform"
                  >
                    {selectedIds.length === filteredProjects.length && filteredProjects.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-5">UID</th>
                <th className="px-6 py-5">项目名称</th>
                <th className="px-6 py-5">项目组成内容</th>
                {isAdmin && <th className="px-6 py-5">录入者</th>}
                <th className="px-6 py-5 text-center">工作天数汇总</th>
                <th className="px-6 py-5 text-center">预估分值</th>
                <th className="px-6 py-5">日期</th>
                <th className="px-6 py-5 text-center">项目状态</th>
                <th className="px-6 py-5 text-right px-8">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.map(p => (
                <tr 
                  key={p.id} 
                  className={`transition-colors group ${selectedIds.includes(p.id) ? 'bg-indigo-500/[0.05]' : 'hover:bg-indigo-500/[0.02]'}`}
                >
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleSelect(p.id)}
                      className={`p-1 rounded border transition-all ${selectedIds.includes(p.id) ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-950 border-white/5 text-slate-700 hover:border-indigo-500/50'}`}
                    >
                      {selectedIds.includes(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-1.5 font-mono text-indigo-400 text-xs font-black">
                      <Hash className="w-3 h-3 opacity-50" /> {p.id}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-white text-sm font-bold">{p.projectName}</p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-white text-sm font-bold">{p.type}</p>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">{p.content}</p>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-6">
                      <div className="inline-flex items-center gap-1.5 text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-lg">
                        <UserIcon className="w-3 h-3" />
                        <span className="text-[10px] font-black">{p.creatorName}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-1 text-slate-400 font-mono text-xs font-bold bg-slate-900/50 px-2 py-1 rounded-lg">
                      <Clock className="w-2.5 h-2.5" />
                      {p.totalWorkDays?.toFixed(1)} <span className="text-[10px] opacity-60">D</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-white font-mono font-black px-2.5 py-1 bg-slate-900 rounded-lg border border-white/5 shadow-inner">{p.score.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-6 text-slate-500 text-[11px] font-mono">{p.entryTime}</td>
                  <td className="px-6 py-6 text-center">
                    <select 
                      disabled={!isAdmin && p.createdBy !== currentUser.id}
                      value={p.status}
                      onChange={(e) => onUpdateProjectStatus(p.id, e.target.value as ProjectStatus)}
                      className={`text-[11px] font-black px-3 py-1.5 rounded-xl bg-slate-950 border transition-all cursor-pointer outline-none ${p.status === '已完成' ? 'text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'}`}
                    >
                      <option value="进行中">进行中</option>
                      <option value="已完成">已完成</option>
                    </select>
                  </td>
                  <td className="px-6 py-6 text-right px-8">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {(isAdmin || p.createdBy === currentUser.id) && p.status !== '已完成' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditProject(p.id); }}
                          title="修改项目"
                          className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {(isAdmin || p.createdBy === currentUser.id) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                          title="删除项目"
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr><td colSpan={isAdmin ? 9 : 8} className="py-20 text-center text-slate-600 italic">暂无明细记录或无访问权限</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 积分明细表 */}
      <div className="tech-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="px-8 py-6 bg-slate-900/40 border-b border-white/5 flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">积分明细表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-5">获得者</th>
                <th className="px-6 py-5">项目 UID</th>
                <th className="px-6 py-5">项目名称</th>
                <th className="px-6 py-5">内容明细</th>
                <th className="px-6 py-5 text-center">个人工作天数</th>
                <th className="px-6 py-5 text-center">分值</th>
                <th className="px-6 py-5">结算日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPersonnel.map((r) => {
                const project = projectRecords.find(p => p.id === r.projectId);
                const isInProgress = project?.status === '进行中';
                return (
                  <tr key={r.id} className={`hover:bg-white/[0.02] transition-colors ${isInProgress ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shadow-inner border border-white/5">
                          {r.person.charAt(0)}
                        </div>
                        <span className="text-white font-bold text-sm">{r.person}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1 font-mono text-indigo-400 text-xs font-bold">
                        <Hash className="w-2.5 h-2.5 opacity-40" /> {r.projectId}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-white text-sm font-bold">{project?.projectName || '未命名项目'}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-slate-200 text-xs font-medium">{r.content}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="text-slate-400 font-mono text-xs font-black">
                        {r.workDays?.toFixed(1)} <span className="text-[10px] opacity-40">D</span>
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {isInProgress ? (
                        <span className="text-slate-600 text-[10px] italic">进行中...</span>
                      ) : (
                        <span className="text-emerald-400 font-mono font-black text-sm">+{r.score.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-slate-500 text-[11px] font-mono">{r.entryTime}</td>
                  </tr>
                );
              })}
              {filteredPersonnel.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-slate-600 italic">暂无明细数据或无访问权限</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 人员得分表 */}
      <div className="tech-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="px-8 py-6 bg-slate-900/40 border-b border-white/5 flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">人员得分表 (基于当前可见数据)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-5">人员</th>
                <th className="px-6 py-5 text-center">工作天数汇总</th>
                <th className="px-6 py-5 text-center">已完成项</th>
                <th className="px-6 py-5 text-center">进行中项</th>
                <th className="px-6 py-5 text-right px-10">已结算积分汇总</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summaryData.map((s, i) => (
                <tr key={i} className="hover:bg-indigo-500/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-lg border border-emerald-500/10">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-white font-black text-base">{s.person}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-black px-3 py-1.5 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono text-base">{s.totalWorkDays.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-600">DAYS</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-black px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 text-xs">
                       <CheckCircle className="w-3.5 h-3.5" /> {s.completed}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-black px-3 py-1.5 bg-amber-500/5 rounded-full border border-amber-500/10 text-xs">
                       <Clock className="w-3.5 h-3.5" /> {s.inProgress}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right px-10">
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white text-2xl font-black font-mono tracking-tighter shadow-indigo-500/20">{s.points.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase">PTS</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {summaryData.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-600 italic">暂无人员得分汇总</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordsDashboard;
