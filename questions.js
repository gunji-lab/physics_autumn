// Physics Trainer 2: 秋学期の授業順。問題はここだけで差し替えられます。
window.AUTUMN_UNITS = [
  { id: "charge", date: "10/2", title: "電荷とクーロンの法則", questions: [
    { id: "charge-1", prompt: "電荷 +2 μC と +3 μC を 0.30 m 離した。静電気力の大きさは？（k = 9.0×10⁹ N·m²/C²）", choices: ["0.060 N", "0.60 N", "6.0 N", "60 N"], answer: 1, explanation: "F = kq₁q₂/r² = 0.60 N。" },
    { id: "charge-2", prompt: "2つの点電荷の距離を2倍にすると、静電気力は何倍？", choices: ["1/4倍", "1/2倍", "2倍", "4倍"], answer: 0, explanation: "クーロンの法則では力は距離の2乗に反比例します。" },
    { id: "charge-3", prompt: "正電荷と負電荷の間にはどの向きの力がはたらく？", choices: ["互いに引き合う", "互いに反発する", "力ははたらかない"], answer: 0, explanation: "異符号の電荷は引き合います。" }
  ]}
];
