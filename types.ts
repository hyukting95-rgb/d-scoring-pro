
export enum DesignProjectType {
  THREE_SERIES_CMF = '3 系项目-CMF',
  THREE_SERIES_CMFP = '3 系项目-CMFP',
  FOUR_SERIES_INNOVATION = '4 系项目-创新性项目',
  FIVE_SERIES_INNOVATION = '5 系项目-开模创新性项目'
}

export enum PackageProjectType {
  BASIC = '基础型包装',
  MICRO_INNOVATION = '微创新型包装',
  INNOVATION = '创新型包装'
}

export enum ManualProjectType {
  LIGHTWEIGHT = '轻量化说明书内容制作',
  MEDIUM = '中量化说明书内容制作',
  ORIGINAL = '原创性说明书内容制作'
}

export interface AdditionalOption {
  id: string;
  label: string;
  score: number;
}

export type ProjectStatus = '进行中' | '已完成';

export type UserRole = '管理员' | '普通用户';
export type UserStatus = '活跃' | '停用';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  type: string;
  content: string;
  entryTime: string;
  score: number;
  responsiblePerson: string;
  status: ProjectStatus;
  scoringParts: { label: string; value: number }[];
  totalWorkDays: number;
  createdBy: string; // 用户UID
  creatorName: string; // 冗余存储用户名用于显示
  rawSelections: {
    selectedDesignType: DesignProjectType | null;
    selectedPackageType: PackageProjectType | null;
    selectedManualType: ManualProjectType | null;
    cmfValue: number;
    cmfPerson: string;
    cmfWorkDays: number;
    cmfpMode: 'additional' | 'none';
    cmfpPerson1: string;
    cmfpMainWorkDays: number;
    cmfpPerson2: string;
    cmfpSupportWorkDays: number;
    mainCreator: string;
    designBaseWorkDays: number;
    isIndependent: 'yes' | 'no';
    baseScore: number;
    selectedAddons: string[];
    addonPersons: Record<string, string>;
    addonWorkDays: Record<string, number>;
    packagePerson: string;
    packageWorkDays: number;
    manualPerson: string;
    manualWorkDays: number;
  };
}

export interface PersonnelRecord {
  id: string;
  person: string;
  projectId: string;
  entryTime: string;
  score: number;
  content: string;
  workDays: number;
  createdBy: string; // 关联录入者
}

export interface ScoringConfig {
  cmf: { label: string; value: number }[];
  cmfp: { mode: string; main: number; support: number }[];
  base4: { label: string; value: number }[];
  base5: { label: string; value: number }[];
  addons: AdditionalOption[];
  package: { type: PackageProjectType; score: number }[];
  manual: { type: ManualProjectType; score: number }[];
}
