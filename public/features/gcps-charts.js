function enableTooltips(f,data,idx,names){
 const plot=f.querySelector('.plot'),svg=plot.querySelector('svg'),dots=[...svg.querySelectorAll('circle')].slice(0,data.length);
 svg.removeAttribute('aria-hidden');svg.setAttribute('role','group');svg.setAttribute('aria-label',f.querySelector('figcaption').textContent);
 svg.querySelectorAll('circle title').forEach(t=>t.remove());
 const tip=document.createElement('div');tip.className='point-tip';tip.hidden=true;plot.append(tip);
 const xs=dots.map(dot=>Number(dot.getAttribute('cx')));
 data.forEach((row,i)=>{
 const left=i?(xs[i-1]+xs[i])/2:48,right=i+1<xs.length?(xs[i]+xs[i+1])/2:600;
 const hit=document.createElementNS(svg.namespaceURI,'rect');
 for(const [k,v] of Object.entries({x:left,y:10,width:right-left,height:177,fill:'transparent',tabindex:0,role:'group'}))hit.setAttribute(k,v);
 const text=idx.map(j=>{const n=row[j];if(f.id==='data-graduation-gap')return names[j]+': '+n.toFixed(2)+'%';if(names[j]==='Rate')return 'Graduation rate: '+n.toFixed(1)+'%';if(names[j]==='Students')return 'Students: '+n.toLocaleString('en-US');return names[j]+': '+n.toFixed(2)+' grade equivalents';});
 const label=[row[0],...text].join('\n');hit.setAttribute('aria-label',label.replaceAll('\n',', '));
 function show(){tip.textContent=label;tip.hidden=false;tip.style.left=Math.max(0,Math.min(plot.clientWidth-tip.offsetWidth,(xs[i]/620)*plot.clientWidth-tip.offsetWidth/2))+'px';}
 function hide(){tip.hidden=true}
 hit.addEventListener('pointerenter',show);hit.addEventListener('pointerdown',show);hit.addEventListener('focus',show);hit.addEventListener('blur',hide);hit.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});svg.append(hit);
 });plot.onpointerleave=()=>{tip.hidden=true};
}
for(const f of document.querySelectorAll('.ex')){
 const table=f.querySelector('table'), head=[...table.tHead.rows[0].cells], rows=[...table.tBodies[0].rows], data=rows.map(r=>[...r.cells].map(c=>Number(c.dataset.value ?? c.textContent.replace('−','-')))),names=head.filter(c=>!c.hasAttribute('data-table-only')).map(c=>c.textContent);
 const ctl=f.querySelector('.control'), multi=names.length>2;
 ctl.innerHTML='<label>View <select></select></label>'; const sel=ctl.querySelector('select');
 for(const [i,n] of (multi?['All comparisons',...names.slice(1)]:['All years',...data.map(r=>r[0])]).entries())sel.add(new Option(n,i));
 function draw(){const pick=+sel.value,idx=names.slice(1).map((_,i)=>i+1).filter(i=>!multi||!pick||i===pick), colors=['#17634f','#ad4c26','#325c96'];const groupRates=f.id==='data-graduation-gap',lo=groupRates?0:multi?-1:0,hi=groupRates?100:multi?1:names[1]==='Students'?180000:100;const X=x=>65+(x-data[0][0])/(data.at(-1)[0]-data[0][0])*515,Y=y=>170-(y-lo)/(hi-lo)*140;
 let s='';for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;s+='<path stroke="#d9dfda" d="M65 '+Y(v)+'H580"/><text x="55" y="'+(Y(v)+4)+'" text-anchor="end">'+v.toLocaleString()+'</text>'}
 for(const j of idx){const col=colors[j-1];s+='<polyline fill="none" stroke="'+col+'" stroke-width="3" points="'+data.map(r=>X(r[0])+','+Y(r[j])).join(' ')+'"/>';data.forEach((r,i)=>s+='<circle cx="'+X(r[0])+'" cy="'+Y(r[j])+'" r="'+(!multi&&pick===i+1?7:4)+'" fill="'+col+'"><title>'+r[0]+' · '+names[j]+': '+r[j]+'</title></circle>');}
 data.forEach((r,i)=>{if(data.length<9||i%2===0)s+='<text x="'+X(r[0])+'" y="192" text-anchor="middle">'+r[0]+'</text>'});
 f.querySelector('.plot').innerHTML='<svg aria-hidden="true" viewBox="0 0 620 205" font-family="Arial" font-size="14">'+s+'</svg>'+(multi?idx.map(j=>'<span style="font:14px Arial;margin-right:12px;color:'+colors[j-1]+'">● '+names[j]+'</span>').join(''):'');rows.forEach((r,i)=>r.hidden=!multi&&pick!==0&&pick!==i+1);head.forEach((_,j)=>{const hide=multi&&pick&&j!==0&&j!==pick;head[j].hidden=!!hide;rows.forEach(r=>r.cells[j].hidden=!!hide)});enableTooltips(f,data,idx,names);}
 head.forEach((h,j)=>{const b=document.createElement('button');b.textContent=h.textContent;b.title='Sort by '+b.textContent;h.replaceChildren(b);b.onclick=()=>{const asc=h.getAttribute('aria-sort')!=='ascending';head.forEach(c=>c.removeAttribute('aria-sort'));h.setAttribute('aria-sort',asc?'ascending':'descending');[...rows].sort((x,y)=>(data[rows.indexOf(x)][j]-data[rows.indexOf(y)][j])*(asc?1:-1)).forEach(r=>table.tBodies[0].append(r))}});sel.onchange=draw;draw();}
