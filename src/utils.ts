import { MONTHS } from './theme';
import { KhataEntry, OnlineTx } from './types';

export function fmt(n: number): string {
  const num = Number(n) || 0;
  const neg = num < 0;
  const intPart = Math.abs(num).toFixed(0);
  let lastThree = intPart.substring(intPart.length - 3);
  let other = intPart.substring(0, intPart.length - 3);
  if (other !== '') lastThree = ',' + lastThree;
  const formatted = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return (neg ? '-' : '') + formatted;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateToParts(ts: number): { day: string; month: string; year: string } {
  const d = new Date(ts);
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
}

export function partsToTs(day: string, month: string, year: string, fallbackTs: number): number {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (!dayNum || !monthNum || !yearNum || yearNum < 1000) return fallbackTs;

  const d = new Date(fallbackTs);
  d.setFullYear(yearNum, monthNum - 1, dayNum);
  return d.getTime();
}

export function buildHtmlReport(khata: KhataEntry[], online: OnlineTx[]): string {
  const total = online.reduce((s, t) => s + t.amt, 0);

  const khataRows = khata.map(e => {
    const lines = e.pairs
      .map(p => `<div>${fmt(+p.amt || 0)} - ${escapeHtml(p.name || '')}</div>`)
      .join('');
    return `<tr>
      <td>${formatDate(e.ts)}</td>
      <td>${e.prev !== '' ? fmt(+e.prev) : ''}</td>
      <td>${lines}</td>
    </tr>`;
  }).join('');

  const onlineRows = online.map(t => `<tr>
  <td>${formatDate(t.ts)}</td>
  <td style="color:${t.amt >= 0 ? '#16a34a' : '#dc2626'}">
    ${t.amt >= 0 ? '+' : '-'}${fmt(Math.abs(t.amt))}
  </td>
  <td>${t.desc || 'Paytm'}</td>
</tr>`).join('');

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #12200a; }
      h1 { margin-bottom: 4px; }
      h2 { margin-top: 32px; border-bottom: 2px solid #a3e635; padding-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
      th { background: #a3e635; }
      .total { font-size: 20px; font-weight: bold; margin-top: 8px; }
      .meta { color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>Khata Report</h1>
    <div class="meta">Generated on ${new Date().toLocaleString('en-IN')}</div>

    <h2>Khata Entries</h2>
    <table>
      <tr><th>Date</th><th>Previous</th><th>Details</th></tr>
      ${khataRows || '<tr><td colspan="3">No entries</td></tr>'}
    </table>

    <h2>Online Transactions</h2>
<div class="total">Total Online: ${fmt(total)}</div>
<table>
  <tr><th>Date</th><th>Amount</th><th>Description</th></tr>
  ${onlineRows || '<tr><td colspan="3">No transactions</td></tr>'}
</table>
  </body>
  </html>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}