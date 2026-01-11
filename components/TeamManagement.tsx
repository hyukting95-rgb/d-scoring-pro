
import React from 'react';
import { Users, Shield, User as UserIcon, Calendar, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { User } from '../types';

interface Props {
  users: User[];
  onToggleStatus: (userId: string) => void;
  currentUserId: string;
}

const TeamManagement: React.FC<Props> = ({ users, onToggleStatus, currentUserId }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">团队管理</h2>
            <p className="text-slate-500 text-sm font-medium">配置人员访问权限与账户状态</p>
          </div>
        </div>
        <div className="px-6 py-2 bg-slate-900 rounded-full border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Total Members: {users.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className={`tech-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group transition-all duration-300 ${user.status === '停用' ? 'opacity-70 grayscale-[0.8]' : 'hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-2xl'}`}>
            {/* Status Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 ${user.status === '停用' ? 'bg-red-500' : 'bg-indigo-500'}`} />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/5 ${user.role === '管理员' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg flex items-center gap-2">
                      {user.username}
                      {user.id === currentUserId && <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">ME</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Shield className={`w-3 h-3 ${user.role === '管理员' ? 'text-indigo-400' : 'text-slate-500'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === '管理员' ? 'text-indigo-400' : 'text-slate-500'}`}>{user.role}</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${user.status === '活跃' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                   {user.status === '活跃' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                   {user.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-1 block">Account ID</label>
                    <span className="text-white font-mono text-xs">{user.id}</span>
                 </div>
                 <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-1 block">Joined Date</label>
                    <span className="text-white font-mono text-xs">{user.createdAt}</span>
                 </div>
              </div>

              {user.id !== currentUserId && (
                <button 
                  onClick={() => onToggleStatus(user.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${user.status === '活跃' ? 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                >
                  {user.status === '活跃' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {user.status === '活跃' ? '停用此账户权限' : '恢复此账户权限'}
                </button>
              )}

              {user.id === currentUserId && (
                 <div className="w-full py-3 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                    CANNOT MODIFY SELF STATUS
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
