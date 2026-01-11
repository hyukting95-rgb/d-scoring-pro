
import React, { useState } from 'react';
import { Shield, User as UserIcon, Lock, UserPlus, LogIn, Monitor } from 'lucide-react';
import { User, UserRole } from '../types';
import { authAPI } from '../src/services/api';

interface Props {
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthView: React.FC<Props> = ({ setCurrentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('普通用户');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 用户登录
        const response = await authAPI.login({ username, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setCurrentUser(user);
      } else {
        // 用户注册
        await authAPI.register({ username, password, role });
        setIsLogin(true);
        alert('注册成功，请登录！');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0c10]">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 tech-gradient rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">D-Scoring Pro</h1>
          <p className="text-slate-500 mt-2 font-medium">设计部绩效分值管理平台</p>
        </div>

        <div className="tech-card rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-2xl mb-8 border border-slate-800">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LogIn className="w-4 h-4" /> 登录
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <UserPlus className="w-4 h-4" /> 注册
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">用户名</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full glass-input rounded-xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-slate-700" 
                  placeholder="输入用户名"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">密码</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-slate-700" 
                  placeholder="输入密码"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">权限申请</label>
                <div className="flex gap-2">
                   <button 
                    type="button"
                    onClick={() => setRole('管理员')}
                    className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${role === '管理员' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                   >
                     管理员
                   </button>
                   <button 
                    type="button"
                    onClick={() => setRole('普通用户')}
                    className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${role === '普通用户' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                   >
                     普通用户
                   </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 rounded-2xl tech-gradient text-white font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLogin ? <><LogIn className="w-5 h-5" /> 进入系统</> : <><UserPlus className="w-5 h-5" /> 立即注册</>}
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
           <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase tracking-widest">
              <Monitor className="w-3 h-3" /> WEB ACCESS
           </div>
           <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase tracking-widest">
              <Shield className="w-3 h-3" /> SECURE SESSION
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
