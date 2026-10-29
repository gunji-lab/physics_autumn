(() => {
  "use strict";
  const clean=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(4)));
  const mc=(id,topic,prompt,correct,wrong,explanation)=>{
    const pos=(Number(id.match(/\d+$/)?.[0]||0)-1)%4, choices=wrong.slice(0,3);choices.splice(pos,0,correct);
    return {id,topic,prompt,choices,answer:pos,explanation};
  };
  const levels={};

  const currentCases=[
    ["Q",2,5],["Q",3,4],["Q",0.5,8],["Q",1.5,6],["Q",0.2,30],["Q",4,2.5],["Q",0.8,15],
    ["I",18,6],["I",24,8],["I",7.5,5],["I",12,30],["I",2.4,12],["I",45,15],["I",0.8,4],
    ["t",20,4],["t",36,6],["t",7.5,1.5],["t",12,0.4],["t",2.4,0.8],["t",50,2.5]
  ];
  levels.level1=currentCases.map((c,n)=>{
    const id=`oj1-${String(n+1).padStart(2,"0")}`;
    if(c[0]==="Q"){const [,i,t]=c,a=i*t;return mc(id,"Q = It",`電流 ${clean(i)} A が ${clean(t)} s 間流れた。通過した電気量 Q は？`,`${clean(a)} C`,[`${clean(i/t)} C`,`${clean(t/i)} C`,`${clean(i+t)} C`],`Q = It = ${clean(i)} × ${clean(t)} = ${clean(a)} C。`)}
    if(c[0]==="I"){const [,q,t]=c,a=q/t;return mc(id,"Q = It",`${clean(t)} s 間に ${clean(q)} C の電気量が通過した。電流 I は？`,`${clean(a)} A`,[`${clean(q*t)} A`,`${clean(t/q)} A`,`${clean(q+t)} A`],`I = Q/t = ${clean(q)} ÷ ${clean(t)} = ${clean(a)} A。`)}
    const [,q,i]=c,a=q/i;return mc(id,"Q = It",`電流 ${clean(i)} A で ${clean(q)} C の電気量が通過するのに必要な時間 t は？`,`${clean(a)} s`,[`${clean(q*i)} s`,`${clean(i/q)} s`,`${clean(q+i)} s`],`t = Q/I = ${clean(q)} ÷ ${clean(i)} = ${clean(a)} s。`);
  });

  const ohmCases=[
    ["I",12,4],["I",6,3],["I",9,6],["I",24,8],["I",5,10],["I",18,12],["I",3,20],
    ["V",2,5],["V",0.5,12],["V",3,8],["V",1.5,10],["V",0.2,30],["V",4,2.5],["V",0.8,15],
    ["R",12,3],["R",6,2],["R",9,1.5],["R",24,4],["R",5,0.5],["R",18,1.5]
  ];
  levels.level2=ohmCases.map((c,n)=>{
    const id=`oj2-${String(n+1).padStart(2,"0")}`;
    if(c[0]==="I"){const [,v,r]=c,a=v/r;return mc(id,"オームの法則",`電圧 ${clean(v)} V、抵抗 ${clean(r)} Ω の回路に流れる電流 I は？`,`${clean(a)} A`,[`${clean(v*r)} A`,`${clean(r/v)} A`,`${clean(v+r)} A`],`I = V/R = ${clean(v)} ÷ ${clean(r)} = ${clean(a)} A。`)}
    if(c[0]==="V"){const [,i,r]=c,a=i*r;return mc(id,"オームの法則",`抵抗 ${clean(r)} Ω に電流 ${clean(i)} A が流れている。加えた電圧 V は？`,`${clean(a)} V`,[`${clean(i/r)} V`,`${clean(r/i)} V`,`${clean(i+r)} V`],`V = IR = ${clean(i)} × ${clean(r)} = ${clean(a)} V。`)}
    const [,v,i]=c,a=v/i;return mc(id,"オームの法則",`電圧 ${clean(v)} V を加えると電流 ${clean(i)} A が流れた。抵抗 R は？`,`${clean(a)} Ω`,[`${clean(v*i)} Ω`,`${clean(i/v)} Ω`,`${clean(v+i)} Ω`],`R = V/I = ${clean(v)} ÷ ${clean(i)} = ${clean(a)} Ω。`);
  });

  const jouleCases=[
    [2,3,5],[1,6,10],[0.5,8,12],[3,2,4],[1.5,4,6],[0.2,50,20],[4,1.5,3],[0.8,10,15],[2.5,4,2],[0.4,25,8],
    [1.2,5,10],[3,0.5,6],[0.25,32,16],[2,10,1.5],[5,0.8,4],[0.6,20,5],[1.5,12,2],[0.3,40,10],[2.4,2.5,5],[0.75,16,8]
  ];
  levels.level3=jouleCases.map(([i,r,t],n)=>{const p=i*i*r,q=p*t,id=`oj3-${String(n+1).padStart(2,"0")}`;return mc(id,"Q = I²Rt",`抵抗 ${clean(r)} Ω に電流 ${clean(i)} A を ${clean(t)} s 間流した。(1) 1秒あたりの発熱量 P　(2) 発生した熱量 Q の組合せは？`,`(1) ${clean(p)} W　(2) ${clean(q)} J`,[`(1) ${clean(i*r+r)} W　(2) ${clean((i*r+r)*t)} J`,`(1) ${clean(p*t)} W　(2) ${clean(p)} J`,`(1) ${clean(i+t)} W　(2) ${clean((i+t)*r)} J`],`(1) P = I²R = ${clean(i)}² × ${clean(r)} = ${clean(p)} W。(2) Q = Pt = ${clean(p)} × ${clean(t)} = ${clean(q)} J。`)});

  const ivCases=[
    [2,6,5],[1,12,10],[0.5,8,20],[3,4,6],[1.5,10,8],[0.2,15,30],[4,3,2],[0.8,20,15],[2.5,6,4],[0.4,25,12],
    [1.2,5,10],[3,9,5],[0.25,24,16],[2,10,3],[5,2,4],[0.6,30,5],[1.5,12,2],[0.3,40,10],[2.4,5,5],[0.75,16,8]
  ];
  levels.level4=ivCases.map(([i,v,t],n)=>{const p=i*v,q=p*t,id=`oj4-${String(n+1).padStart(2,"0")}`;return mc(id,"Q = IVt",`電圧 ${clean(v)} V、電流 ${clean(i)} A の器具を ${clean(t)} s 間使用した。(1) 電力 P　(2) 発生した熱量 Q の組合せは？`,`(1) ${clean(p)} W　(2) ${clean(q)} J`,[`(1) ${clean(v-i)} W　(2) ${clean((v-i)*t)} J`,`(1) ${clean(p*t)} W　(2) ${clean(p)} J`,`(1) ${clean(v+i)} W　(2) ${clean((v+i)*t)} J`],`(1) P = IV = ${clean(i)} × ${clean(v)} = ${clean(p)} W。(2) Q = Pt = ${clean(p)} × ${clean(t)} = ${clean(q)} J。`)});

  const vrCases=[
    [12,6,5],[6,3,10],[10,5,8],[9,3,4],[8,4,6],[15,5,2],[20,10,3],[4,8,12],[24,12,5],[5,10,20],
    [18,6,2],[3,9,15],[16,8,4],[10,20,10],[25,5,2],[12,4,6],[6,12,8],[30,15,3],[14,7,5],[8,16,10]
  ];
  levels.level5=vrCases.map(([v,r,t],n)=>{const p=v*v/r,q=p*t,id=`oj5-${String(n+1).padStart(2,"0")}`;return mc(id,"Q = V²t/R",`抵抗 ${clean(r)} Ω に電圧 ${clean(v)} V を ${clean(t)} s 間加えた。(1) 電力 P　(2) 発生した熱量 Q の組合せは？`,`(1) ${clean(p)} W　(2) ${clean(q)} J`,[`(1) ${clean(v/r)} W　(2) ${clean(v/r*t)} J`,`(1) ${clean(p*t)} W　(2) ${clean(p)} J`,`(1) ${clean(v+r)} W　(2) ${clean((v+r)*t)} J`],`(1) P = V²/R = ${clean(v)}² ÷ ${clean(r)} = ${clean(p)} W。(2) Q = Pt = ${clean(p)} × ${clean(t)} = ${clean(q)} J。`)});

  const power=[
    ["p",600,3],["p",1200,4],["p",900,1.5],["p",3000,10],["p",150,0.5],
    ["e",100,30],["e",60,120],["e",1500,20],["e",800,45],["e",40,300],
    ["wh",100,2],["wh",600,0.5],["wh",1200,3],["wh",50,4],["wh",1500,2],
    ["kwh",1000,2],["kwh",500,3],["kwh",1200,2.5],["kwh",2000,0.5],["kwh",750,4]
  ];
  levels.level6=power.map((c,n)=>{const id=`oj6-${String(n+1).padStart(2,"0")}`;
    if(c[0]==="p"){const [,e,t]=c,a=e/t;return mc(id,"電力",`${clean(t)} s 間に ${clean(e)} J の電気エネルギーを使用した。電力は？`,`${clean(a)} W`,[`${clean(e*t)} W`,`${clean(t/e)} W`,`${clean(e+t)} W`],`P = E/t = ${clean(e)} ÷ ${clean(t)} = ${clean(a)} W。`)}
    if(c[0]==="e"){const [,p,t]=c,a=p*t;return mc(id,"電力量",`消費電力 ${clean(p)} W の器具を ${clean(t)} s 間使用した。電力量は？`,`${clean(a)} J`,[`${clean(p/t)} J`,`${clean(t/p)} J`,`${clean(p+t)} J`],`E = Pt = ${clean(p)} × ${clean(t)} = ${clean(a)} J。`)}
    if(c[0]==="wh"){const [,p,h]=c,a=p*h;return mc(id,"Wh",`消費電力 ${clean(p)} W の器具を ${clean(h)} 時間使用した。電力量は？`,`${clean(a)} Wh`,[`${clean(a/1000)} Wh`,`${clean(p/h)} Wh`,`${clean(p*3600*h)} Wh`],`電力量 = 電力 × 時間 = ${clean(p)} × ${clean(h)} = ${clean(a)} Wh。`)}
    const [,p,h]=c,a=p*h/1000;return mc(id,"kWh",`消費電力 ${clean(p)} W の器具を ${clean(h)} 時間使用した。電力量は？`,`${clean(a)} kWh`,[`${clean(p*h)} kWh`,`${clean(p/h/1000)} kWh`,`${clean(p*h*1000)} kWh`],`${clean(p)} W = ${clean(p/1000)} kW。電力量 = ${clean(p/1000)} × ${clean(h)} = ${clean(a)} kWh。`);
  });

  window.OHM_JOULE_LEVELS={};
  const titles=["電流と電気量","オームの法則","ジュールの法則①","ジュールの法則②","ジュールの法則③","電力と電力量"];
  for(let i=1;i<=6;i++)window.OHM_JOULE_LEVELS[`level${i}`]={title:`${titles[i-1]} · Level ${i}`,stage:`電磁気/第5回/オーム・ジュール/Level ${i}`,questions:levels[`level${i}`]};
})();