export type Pair = { amt: string; name: string };
export type HomeData = { prev: string; pairs: Pair[] };
export type KhataEntry = { prev: string; pairs: Pair[]; ts: number };
export type OnlineTx = { amt: number; ts: number; desc: string };
export type TabKey = 'home' | 'khata' | 'online' | 'settings';

export type BackupData = {
  home: HomeData;
  khata: KhataEntry[];
  online: OnlineTx[];
};