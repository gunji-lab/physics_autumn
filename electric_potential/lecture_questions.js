window.POTENTIAL_LECTURE_1 = {
  stage: "電磁気/第4回/電位/講義内演習①",
  questions: [
    {id:"ep-lecture1-01a",group:"問1　電位と電荷の移動方向",badge:"問1 (1)",context:"地点A、B、Cの電位は、それぞれ12 V、8 V、4 Vである。電位はAからCへ向かってなめらかに低くなっている。地点Bに電荷を静かに置き、静電気力だけが働くものとする。",visual:"potential-gradient",prompt:"地点Bに置いた +1 C の電荷は、どちらに動き始めるか。",choices:["左（地点Aの方向）","右（地点Cの方向）","動かない"],answer:1,explanation:"正電荷は電場と同じ向き、つまり電位が低くなる方向へ力を受けます。"},
    {id:"ep-lecture1-01b",group:"問1　電位と電荷の移動方向",badge:"問1 (2)",context:"地点A、B、Cの電位は、それぞれ12 V、8 V、4 Vである。電位はAからCへ向かってなめらかに低くなっている。地点Bに電荷を静かに置き、静電気力だけが働くものとする。",visual:"potential-gradient",prompt:"地点Bに置いた −1 C の電荷は、どちらに動き始めるか。",choices:["左（地点Aの方向）","右（地点Cの方向）","動かない"],answer:0,explanation:"負電荷は電場と逆向き、つまり電位が高くなる方向へ力を受けます。"},
    {id:"ep-lecture1-02a",group:"問2　電位は何によって決まる？",badge:"問2 (1)",context:"ある地点Pの電位は10 Vである。この地点に置く試験電荷の大きさや符号を変える。ただし、試験電荷は周囲の電位に影響を与えないものとする。",prompt:"+1 C の試験電荷を +2 C に変えたとき、地点Pの電位は何Vになるか。",choices:["5 V","10 V","20 V","−10 V"],answer:1,explanation:"電位はその場所の性質なので、置く試験電荷の大きさには依存しません。"},
    {id:"ep-lecture1-02b",group:"問2　電位は何によって決まる？",badge:"問2 (2)",context:"ある地点Pの電位は10 Vである。この地点に置く試験電荷の大きさや符号を変える。ただし、試験電荷は周囲の電位に影響を与えないものとする。",prompt:"+1 C の試験電荷を −1 C に変えたとき、地点Pの電位は何Vになるか。",choices:["−10 V","0 V","10 V","20 V"],answer:2,explanation:"電位はその場所の性質なので、置く試験電荷の符号にも依存しません。"},
    {id:"ep-lecture1-03a",group:"問3　静電気力による位置エネルギー",badge:"問3 (1)",context:"電位が6 Vの地点に電荷を置いた。それぞれの静電気力による位置エネルギー U を求めなさい。",formula:"U = qV",prompt:"+2 C の電荷を置いた場合の位置エネルギー U を求めなさい。",kind:"number",unit:"J",answer:12,answerLabel:"12",explanation:"U = qV = 2 × 6 = 12 J です。"},
    {id:"ep-lecture1-03b",group:"問3　静電気力による位置エネルギー",badge:"問3 (2)",context:"電位が6 Vの地点に電荷を置いた。それぞれの静電気力による位置エネルギー U を求めなさい。",formula:"U = qV",prompt:"−3 C の電荷を置いた場合の位置エネルギー U を求めなさい。",kind:"number",unit:"J",answer:-18,answerLabel:"−18",explanation:"U = qV = (−3) × 6 = −18 J です。負電荷では位置エネルギーが負になることがあります。"},
    {id:"ep-lecture1-03c",group:"問3　静電気力による位置エネルギー",badge:"問3 (3)",context:"電位が6 Vの地点に電荷を置いた。それぞれの静電気力による位置エネルギー U を求めなさい。",formula:"U = qV",prompt:"+0.5 C の電荷を置いた場合の位置エネルギー U を求めなさい。",kind:"number",unit:"J",answer:3,answerLabel:"3",explanation:"U = qV = 0.5 × 6 = 3 J です。"},
    {id:"ep-lecture1-04a",group:"問4　位置エネルギーから電位を求める",badge:"問4 (1)",context:"ある地点に +2 C の電荷を置いたところ、その電荷の静電気力による位置エネルギーは16 Jだった。",formula:"V = U / q",prompt:"この地点の電位は何Vか。",kind:"number",unit:"V",answer:8,answerLabel:"8",explanation:"V = U/q = 16/2 = 8 V です。"},
    {id:"ep-lecture1-04b",group:"問4　位置エネルギーから電位を求める",badge:"問4 (2)",context:"ある地点に +2 C の電荷を置いたところ、その電荷の静電気力による位置エネルギーは16 Jだった。この地点の電位は8 Vである。",formula:"U = qV",prompt:"同じ地点に −2 C の電荷を置いた場合、位置エネルギーは何Jになるか。",kind:"number",unit:"J",answer:-16,answerLabel:"−16",explanation:"電位は8 Vのままなので、U = qV = (−2) × 8 = −16 J です。"}
  ]
};
