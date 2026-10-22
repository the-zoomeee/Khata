export type Pair = { amt: string; name: string };
export type HomeData = { prev: string; pairs: Pair[] };
export type KhataEntry = { prev: string; pairs: Pair[]; ts: number };
export type OnlineTx = { amt: number; ts: number; desc: string };
export type VcTx = { amt: number; ts: number; desc: string };
export type VcAccount = {
  id: string;
  name: string;
  vcDate: number;
  opening: number;
  tx: VcTx[];
};
export type TabKey = 'home' | 'khata' | 'online' | 'vc' | 'settings';

export type BackupData = {
  home: HomeData;
  khata: KhataEntry[];
  online: OnlineTx[];
  vc?: VcAccount[];
};