
import React, { useState } from 'react';
import { Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { ScoringConfig } from '../types';

interface Props {
  config: ScoringConfig;
  onSave: (config: ScoringConfig) => void;
}

const ScoringSettings: React.FC<Props> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ScoringConfig>(JSON.parse(JSON.stringify(config)));

  const handleUpdateItem = (category: keyof ScoringConfig, index: number, field: string, value: any) => {
    const updated = { ...localConfig };
    (updated[category] as any)[index][field] = value;
    setLocalConfig(updated);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">项目分数全局设置</h2>
            <p className="text-slate-500 text-sm">修改各子项分值，修改后将同步影响录入计算及存量记录</p>
          </div>
        </div>
        <button 
          onClick={() => onSave(localConfig)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" /> 确认并同步全局
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 1. CMF & CMFP */}
        <section className="tech-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <RefreshCw className="w-4 h-4 text-indigo-400" /> CMF 系列基准分
          </h3>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase">CMF 视觉指导</h4>
            {localConfig.cmf.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-slate-300 w-1/2">{item.label}</span>
                <input 
                  type="number" 
                  step="0.1" 
                  className="glass-input rounded-xl px-4 py-2 text-white w-1/2" 
                  value={item.value} 
                  onChange={e => handleUpdateItem('cmf', i, 'value', parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
            <h4 className="text-xs font-black text-slate-500 uppercase mt-6">CMFP 人员占比</h4>
            {localConfig.cmfp.map((item, i) => (
              <div key={i} className="space-y-2 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-indigo-400 mb-2">{item.mode === 'additional' ? '有额外支持模式' : '无额外支持模式'}</p>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-[10px] text-slate-600 mb-1 block">主创分值</label>
                    <input type="number" step="0.1" className="glass-input rounded-xl px-4 py-2 text-white w-full" value={item.main} onChange={e => handleUpdateItem('cmfp', i, 'main', parseFloat(e.target.value) || 0)} />
                  </div>
                  {item.mode === 'additional' && (
                    <div className="w-1/2">
                      <label className="text-[10px] text-slate-600 mb-1 block">支持分值</label>
                      <input type="number" step="0.1" className="glass-input rounded-xl px-4 py-2 text-white w-full" value={item.support} onChange={e => handleUpdateItem('cmfp', i, 'support', parseFloat(e.target.value) || 0)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 额外加分项 Addons */}
        <section className="tech-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <RefreshCw className="w-4 h-4 text-indigo-400" /> 额外创新加分项
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {localConfig.addons.map((addon, i) => (
              <div key={addon.id} className="flex items-center gap-4 group">
                <span className="text-sm text-slate-300 w-2/3">{addon.label}</span>
                <input 
                  type="number" 
                  step="0.1" 
                  className="glass-input rounded-xl px-4 py-2 text-white w-1/3" 
                  value={addon.score} 
                  onChange={e => handleUpdateItem('addons', i, 'score', parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 3. 包装 & 说明书 */}
        <section className="tech-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <RefreshCw className="w-4 h-4 text-indigo-400" /> 包装与说明书
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-500 uppercase">包装类型</h4>
               {localConfig.package.map((pkg, i) => (
                 <div key={i} className="space-y-1">
                   <span className="text-[10px] text-slate-600">{pkg.type}</span>
                   <input type="number" step="0.1" className="glass-input rounded-xl px-4 py-2 text-white w-full" value={pkg.score} onChange={e => handleUpdateItem('package', i, 'score', parseFloat(e.target.value) || 0)} />
                 </div>
               ))}
            </div>
            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-500 uppercase">说明书制作</h4>
               {localConfig.manual.map((man, i) => (
                 <div key={i} className="space-y-1">
                   <span className="text-[10px] text-slate-600">{man.type}</span>
                   <input type="number" step="0.1" className="glass-input rounded-xl px-4 py-2 text-white w-full" value={man.score} onChange={e => handleUpdateItem('manual', i, 'score', parseFloat(e.target.value) || 0)} />
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* 4. 4/5 系列基础分 */}
        <section className="tech-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <RefreshCw className="w-4 h-4 text-indigo-400" /> 创新项目基础分档位
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase">4 系列基础档</h4>
              {localConfig.base4.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">档位 {i+1}</span>
                  <input type="number" step="0.1" className="glass-input rounded-xl px-3 py-2 text-white w-full" value={b.value} onChange={e => handleUpdateItem('base4', i, 'value', parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase">5 系列基础档</h4>
              {localConfig.base5.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">档位 {i+1}</span>
                  <input type="number" step="0.1" className="glass-input rounded-xl px-3 py-2 text-white w-full" value={b.value} onChange={e => handleUpdateItem('base5', i, 'value', parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScoringSettings;
