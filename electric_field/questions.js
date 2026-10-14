window.FIELD_LEVELS = {
  level1: {
    title: "電場の基礎演習 · Level 1",
    stage: "電磁気/第3項/電場と電気力線/Level 1",
    questions: [
      {id:"ef1-01",prompt:"電場 E は、ある点に置いた小さな正の試験電荷 q が受ける力 F と、どの関係にある？",choices:["E = F/q","E = q/F","E = Fq"],answer:0,explanation:"電場の強さは単位電荷あたりの力で、E = F/q です。"},
      {id:"ef1-02",prompt:"電場の向きは、どの電荷が受ける力の向きで定義する？",choices:["正の試験電荷","負の試験電荷","電荷の符号によらない"],answer:0,explanation:"正の試験電荷が受ける力の向きが電場の向きです。"},
      {id:"ef1-03",prompt:"正電荷と負電荷の間に描く電気力線は、一般にどちらからどちらへ向かう？",choices:["負電荷から正電荷へ","向きはない","正電荷から負電荷へ"],answer:2,explanation:"電気力線は正電荷から出て、負電荷に入ります。"},
      {id:"ef1-04",prompt:"電気力線が密に描かれた場所について正しいものは？",choices:["電場が弱い","電場が強い","電場は必ず0"],answer:1,explanation:"電気力線の密度は電場の強さを表します。"},
      {id:"ef1-05",prompt:"電気力線が交わらない理由として適切なのは？",choices:["一つの点で電場の向きは一つに決まるから","電荷が動かないから","電場が必ず一様だから"],answer:0,explanation:"交わると、その点で電場の向きが二つになってしまいます。"}
    ]
  },
  level2: {
    title: "電場の基礎演習 · Level 2",
    stage: "電磁気/第3項/電場と電気力線/Level 2",
    questions: [
      {id:"ef2-01",prompt:"+3.0 μC の電荷が 0.18 N の力を受ける。電場の強さはいくら？",kind:"number",unit:"N/C",answer:60000,explanation:"E = F/q = 0.18/(3.0×10⁻⁶) = 6.0×10⁴ N/C。"},
      {id:"ef2-02",prompt:"5.0×10⁴ N/C の電場に −2.0 μC の電荷を置く。受ける力の大きさはいくら？",kind:"number",unit:"N",answer:0.1,explanation:"大きさは |q|E = 0.10 N。負電荷なので向きは電場と反対です。"},
      {id:"ef2-03",prompt:"+4.0 nC の点電荷から 0.30 m の点の電場の強さは？（k = 9.0×10⁹ N·m²/C²）",kind:"number",unit:"N/C",answer:400,explanation:"E = kQ/r² = (9.0×10⁹)(4.0×10⁻⁹)/(0.30)² = 400 N/C。"},
      {id:"ef2-04",prompt:"点電荷から 0.20 m の点で電場が 800 N/C だった。距離を 0.40 m にすると電場の強さは？",kind:"number",unit:"N/C",answer:200,explanation:"点電荷による電場は距離の2乗に反比例します。距離が2倍なので 800/4 = 200 N/C。"}
    ]
  }
};
