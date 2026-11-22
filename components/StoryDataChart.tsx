type Series = { label: string; values: number[] };
export type ChartData = { title: string; unit: string; labels: string[]; series: Series[] };

export function StoryDataChart({ chart, caption }: { chart: ChartData; caption?: string }) {
  const values = chart.series.flatMap(series => series.values);
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  const position = (v: number) => 100 * (v - low) / (high - low || 1);
  const format = (v: number) => chart.unit === "%" ? v.toFixed(1) + "%" : v.toLocaleString("en-US");
  return <figure className="atg-data-chart">
    <style>{`
      .atg-data-chart {padding:1rem;border:1px solid #ccc;background:white;color:#17211e}
      .atg-data-chart h3 {margin:0 0 1rem}
      .atg-chart-row {display:grid;grid-template-columns:minmax(6rem,32%) 1fr;gap:.5rem;align-items:center;margin:.65rem 0;font:600 .85rem/1.25 system-ui}
      .atg-chart-track {position:relative;height:1.35rem;margin:.2rem 0;background:#f0f2ef}
      .atg-chart-track::before {content:"";position:absolute;left:var(--origin);top:0;bottom:0;border-left:1px solid #46564f}
      .atg-chart-mark {position:absolute;top:0;bottom:0;min-width:2px;border:0;cursor:pointer;padding:0}
      .atg-chart-tip {display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);z-index:2;background:#17211e;color:white;padding:.4rem .55rem;white-space:nowrap;font:600 .8rem system-ui}
      .atg-chart-mark:hover .atg-chart-tip,.atg-chart-mark:focus .atg-chart-tip {display:block}
      .atg-chart-mark:focus-visible {outline:2px solid black;outline-offset:2px}
    `}</style>
    <h3>{chart.title}</h3>
    {chart.series.length > 1 && <p>{chart.series.map((s,i)=><span key={s.label} style={{marginRight:14}}><b style={{color:i?"#126758":"#aa562b"}}>■</b> {s.label}</span>)}</p>}
    {chart.labels.map((label,j)=><div className="atg-chart-row" key={label}><span>{label}</span><div>
      {chart.series.map((s,i)=>{const n=s.values[j];const detail=s.label+" · "+format(n);return <div key={s.label} className="atg-chart-track" style={{"--origin":position(0)+"%"} as React.CSSProperties}>
        <button type="button" className="atg-chart-mark" aria-label={label+", "+detail} style={{left:position(Math.min(0,n))+"%",width:Math.abs(position(n)-position(0))+"%",background:(chart.series.length>1?i===0:n<0)?"#aa562b":"#126758"}}><span className="atg-chart-tip">{detail}</span></button>
      </div>})}</div></div>)}
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
}
