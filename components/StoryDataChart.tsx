type Series = { color?: string; label: string; values: number[] };
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
    {chart.series.length > 1 && <p>{chart.series.map((s,i)=><span key={s.label} style={{marginRight:14}}><b style={{color:s.color || (i?"#126758":"#aa562b")}}>■</b> {s.label}</span>)}</p>}
    {chart.labels.map((label,j)=><div className="atg-chart-row" key={label}><span>{label}</span><div>
      {chart.series.map((s,i)=>{const n=s.values[j];const detail=s.label+" · "+format(n);return <div key={s.label} className="atg-chart-track" style={{"--origin":position(0)+"%"} as React.CSSProperties}>
        <button type="button" className="atg-chart-mark" aria-label={label+", "+detail} style={{left:position(Math.min(0,n))+"%",width:Math.abs(position(n)-position(0))+"%",background:s.color || ((chart.series.length>1?i===0:n<0)?"#aa562b":"#126758")}}><span className="atg-chart-tip">{detail}</span></button>
      </div>})}</div></div>)}
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
}

export const chartFigures: Record<string, ChartData> = {
  "image-97c5c523b2f0ad4466a71caedffb4280c15bc325-1800x920-png": {
    "title": "Gwinnett’s population since 1970",
    "unit": "people",
    "labels": [
      "1970",
      "1980",
      "1990",
      "2000",
      "2010",
      "2020",
      "2025 estimate"
    ],
    "series": [
      {
        "label": "Residents",
        "values": [
          72349,
          166903,
          352910,
          588448,
          805321,
          957062,
          1018099
        ]
      }
    ]
  },
  "image-fcf2cc10962c751fb1579ca822ca91d5f31adcf4-1800x920-png": {
    "title": "What changed Gwinnett’s population in one year?",
    "unit": "people",
    "labels": [
      "International moves",
      "Births minus deaths",
      "Domestic moves",
      "Census adjustment"
    ],
    "series": [
      {
        "label": "Residents",
        "values": [
          9700,
          5865,
          -7392,
          62
        ]
      }
    ]
  },
  "image-33b60ef2cd842ab8f82f2aa156e81c946b04bde2-1800x960-png": {
    "title": "Race and ethnicity in Gwinnett County",
    "unit": "%",
    "labels": [
      "White",
      "Black",
      "Hispanic or Latino",
      "Asian / Pacific Islander",
      "Other race categories"
    ],
    "series": [
      {
        "label": "1990",
        "color": "#385b93",
        "values": [89.4, 5.1, 2.4, 2.9, 0.2]
      },
      {
        "label": "2010",
        "color": "#aa562b",
        "values": [
          44,
          22.9,
          20.1,
          10.6,
          2.5
        ]
      },
      {
        "label": "2020",
        "values": [
          32.5,
          26.9,
          23,
          13.3,
          4.4
        ]
      }
    ]
  }
};
