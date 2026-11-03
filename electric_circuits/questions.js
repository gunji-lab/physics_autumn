(() => {
  "use strict";
  const clean=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(1)));
  const mc=(id,topic,prompt,correct,wrong,explanation,extra={})=>{
    const pool=[];
    for(const value of wrong){if(value!==correct&&!pool.includes(value))pool.push(value);}
    const fillers=["0","求められない","与えられた値の和"];
    for(const value of fillers){if(pool.length>=3)break;if(value!==correct&&!pool.includes(value))pool.push(value);}
    const pos=(Number(id.match(/\d+$/)?.[0]||0)-1)%4,choices=pool.slice(0,3);choices.splice(pos,0,correct);
    return {id,topic,prompt,choices,answer:pos,explanation,...extra};
  };
  const levels={};

  const currentCases=[
    ["Q",2,5],["Q",3,4],["Q",0.5,8],["Q",1.5,6],["Q",0.2,30],["Q",4,2.5],["Q",0.8,15],
    ["I",18,6],["I",24,8],["I",7.5,5],["I",12,30],["I",2.4,12],["I",45,15],["I",0.8,4],
    ["t",20,4],["t",36,6],["t",7.5,1.5],["t",12,0.4],["t",2.4,0.8],["t",50,2.5]
  ];
  levels.level1=currentCases.map((c,n)=>{
    const id=`ec1-${String(n+1).padStart(2,"0")}`;
    if(c[0]==="Q"){const [,i,t]=c,a=i*t;return mc(id,"電気量を求める",`電流 ${clean(i)} A が ${clean(t)} s 間流れた。通過した電気量 Q は？`,`${clean(a)} C`,[`${clean(i/t)} C`,`${clean(t/i)} C`,`${clean(i+t)} C`],`Q = It = ${clean(i)} × ${clean(t)} = ${clean(a)} C。`)}
    if(c[0]==="I"){const [,q,t]=c,a=q/t;return mc(id,"電流を求める",`${clean(t)} s 間に ${clean(q)} C の電気量が通過した。電流 I は？`,`${clean(a)} A`,[`${clean(q*t)} A`,`${clean(t/q)} A`,`${clean(q+t)} A`],`I = Q/t = ${clean(q)} ÷ ${clean(t)} = ${clean(a)} A。`)}
    const [,q,i]=c,a=q/i;return mc(id,"時間を求める",`電流 ${clean(i)} A で ${clean(q)} C の電気量が通過するのに必要な時間 t は？`,`${clean(a)} s`,[`${clean(q*i)} s`,`${clean(i/q)} s`,`${clean(q+i)} s`],`t = Q/I = ${clean(q)} ÷ ${clean(i)} = ${clean(a)} s。`);
  });

  const ohmCases=[
    ["I",12,4],["I",6,3],["I",9,6],["I",24,8],["I",5,10],["I",18,12],["I",3,15],
    ["V",2,5],["V",0.5,12],["V",3,8],["V",1.5,10],["V",0.2,30],["V",4,2.5],["V",0.8,15],
    ["R",12,3],["R",6,2],["R",9,1.5],["R",24,4],["R",5,0.5],["R",18,1.5]
  ];
  levels.level2=ohmCases.map((c,n)=>{
    const id=`ec2-${String(n+1).padStart(2,"0")}`;
    if(c[0]==="I"){const [,v,r]=c,a=v/r;return mc(id,"電流を求める",`電圧 ${clean(v)} V、抵抗 ${clean(r)} Ω の回路に流れる電流 I は？`,`${clean(a)} A`,[`${clean(v*r)} A`,`${clean(r/v)} A`,`${clean(v+r)} A`],`I = V/R = ${clean(v)} ÷ ${clean(r)} = ${clean(a)} A。`)}
    if(c[0]==="V"){const [,i,r]=c,a=i*r;return mc(id,"電圧を求める",`抵抗 ${clean(r)} Ω に電流 ${clean(i)} A が流れている。加えた電圧 V は？`,`${clean(a)} V`,[`${clean(i/r)} V`,`${clean(r/i)} V`,`${clean(i+r)} V`],`V = IR = ${clean(i)} × ${clean(r)} = ${clean(a)} V。`)}
    const [,v,i]=c,a=v/i;return mc(id,"抵抗を求める",`電圧 ${clean(v)} V を加えると電流 ${clean(i)} A が流れた。抵抗 R は？`,`${clean(a)} Ω`,[`${clean(v*i)} Ω`,`${clean(i/v)} Ω`,`${clean(v+i)} Ω`],`R = V/I = ${clean(v)} ÷ ${clean(i)} = ${clean(a)} Ω。`);
  });

  const seriesCases=[
    [18,3,6],[12,2,4],[20,4,6],[15,2,3],[24,4,8],[30,5,10],[16,3,5],[21,2,5],[36,6,12],[14,3,4],
    [27,3,6],[10,2,3],[32,6,10],[18,2,4],[40,5,15],[24,3,9],[35,5,2],[28,4,10],[45,5,10],[22,4,7]
  ];
  levels.level3=seriesCases.map(([v,r1,r2],n)=>{
    const id=`ec3-${String(n+1).padStart(2,"0")}`,rt=r1+r2,i=v/rt,v1=i*r1,v2=i*r2,type=n%4,extra={visual:"circuit-series",voltage:v,r1,r2};
    if(type===0)return mc(id,"合成抵抗",`図の直列回路の合成抵抗は？`,`${clean(rt)} Ω`,[`${clean(r1*r2)} Ω`,`${clean(Math.abs(r1-r2))} Ω`,`${clean(r1*r2/rt)} Ω`],`直列回路では R = R₁ + R₂ = ${r1} + ${r2} = ${clean(rt)} Ω。`,extra);
    if(type===1)return mc(id,"回路全体の電流",`図の直列回路に流れる電流は？`,`${clean(i)} A`,[`${clean(v/r1)} A`,`${clean(v/r2)} A`,`${clean(v*rt)} A`],`合成抵抗は ${clean(rt)} Ω。I = V/R = ${v} ÷ ${clean(rt)} = ${clean(i)} A。`,extra);
    if(type===2)return mc(id,"電圧降下",`図の直列回路で、抵抗 R₁ にかかる電圧は？`,`${clean(v1)} V`,[`${clean(v2)} V`,`${clean(v)} V`,`${clean(v/r1)} V`],`電流は ${clean(i)} A。V₁ = IR₁ = ${clean(i)} × ${r1} = ${clean(v1)} V。`,extra);
    return mc(id,"電圧降下",`図の直列回路で、抵抗 R₂ にかかる電圧は？`,`${clean(v2)} V`,[`${clean(v1)} V`,`${clean(v)} V`,`${clean(v/r2)} V`],`電流は ${clean(i)} A。V₂ = IR₂ = ${clean(i)} × ${r2} = ${clean(v2)} V。`,extra);
  });

  const parallelCases=[
    [18,3,6],[12,4,6],[24,6,8],[20,5,5],[30,5,10],[16,4,8],[15,3,5],[36,6,12],[14,2,7],[10,2,5],
    [24,4,12],[18,6,9],[12,3,4],[40,8,10],[21,3,7],[30,10,15],[16,2,8],[27,3,9],[20,5,20],[24,8,12]
  ];
  levels.level4=parallelCases.map(([v,r1,r2],n)=>{
    const id=`ec4-${String(n+1).padStart(2,"0")}`,i1=v/r1,i2=v/r2,i=i1+i2,rt=v/i,type=n%4,extra={visual:"circuit-parallel",voltage:v,r1,r2};
    if(type===0)return mc(id,"枝分かれした電流",`図の並列回路で、抵抗 R₁ に流れる電流は？`,`${clean(i1)} A`,[`${clean(i2)} A`,`${clean(v/(r1+r2))} A`,`${clean(v*r1)} A`],`R₁にも電源と同じ ${v} V がかかるので、I₁ = V/R₁ = ${v} ÷ ${r1} = ${clean(i1)} A。`,extra);
    if(type===1)return mc(id,"枝分かれした電流",`図の並列回路で、抵抗 R₂ に流れる電流は？`,`${clean(i2)} A`,[`${clean(i1)} A`,`${clean(v/(r1+r2))} A`,`${clean(v*r2)} A`],`R₂にも電源と同じ ${v} V がかかるので、I₂ = V/R₂ = ${v} ÷ ${r2} = ${clean(i2)} A。`,extra);
    if(type===2)return mc(id,"回路全体の電流",`図の並列回路で、電源から流れ出る電流の大きさは？`,`${clean(i)} A`,[`${clean(Math.abs(i1-i2))} A`,`${clean(v/(r1+r2))} A`,`${clean(v/rt)} Ω`],`I = I₁ + I₂ = ${clean(i1)} + ${clean(i2)} = ${clean(i)} A。`,extra);
    return mc(id,"合成抵抗",`図の並列回路の合成抵抗は？`,`${clean(rt)} Ω`,[`${clean(r1+r2)} Ω`,`${clean(r1*r2)} Ω`,`${clean(Math.abs(r1-r2))} Ω`],`1/R = 1/R₁ + 1/R₂。R = R₁R₂/(R₁+R₂) = ${r1}×${r2}/(${r1}+${r2}) = ${clean(rt)} Ω。`,extra);
  });

  const mixed=[];
  seriesCases.slice(0,10).forEach(([v,r1,r2],n)=>{const rt=r1+r2,i=v/rt,id=`ec5-s${String(n+1).padStart(2,"0")}`;mixed.push(mc(id,"直列回路",`図の回路全体に流れる電流は？`,`${clean(i)} A`,[`${clean(v/r1)} A`,`${clean(v/r2)} A`,`${clean(v*rt)} A`],`直列回路なので合成抵抗は ${r1}+${r2}=${clean(rt)} Ω。I=${v}÷${clean(rt)}=${clean(i)} A。`,{visual:"circuit-series",voltage:v,r1,r2,badge:"直列か並列かを見分けよう"}));});
  parallelCases.slice(0,10).forEach(([v,r1,r2],n)=>{const i1=v/r1,i2=v/r2,i=i1+i2,id=`ec5-p${String(n+1).padStart(2,"0")}`;mixed.push(mc(id,"並列回路",`図の回路全体に流れる電流は？`,`${clean(i)} A`,[`${clean(i1)} A`,`${clean(i2)} A`,`${clean(v/(r1+r2))} A`],`並列回路なので I=I₁+I₂=${clean(i1)}+${clean(i2)}=${clean(i)} A。`,{visual:"circuit-parallel",voltage:v,r1,r2,badge:"直列か並列かを見分けよう"}));});
  levels.level5=mixed;

  window.CIRCUIT_LEVELS={};
  const titles=["電流の計算","オームの法則","直列回路","並列回路","直列・並列ランダム"];
  for(let i=1;i<=5;i++)window.CIRCUIT_LEVELS[`level${i}`]={title:`${titles[i-1]} · Level ${i}`,stage:`電磁気/第5・6回/電気回路/Level ${i}`,questions:levels[`level${i}`]};
})();