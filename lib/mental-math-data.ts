// Mental Math Question Generation — Fully Algorithmic

export interface MathQuestion {
  expression: string; // "24 × 7 = ?"
  answer: number;
  type: string;
  difficulty: number;
}

type QuestionGenerator = () => MathQuestion;

// ---------- Helpers ----------

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Euclidean GCD — works for any positive integers */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** LCM from GCD */
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// ---------- Generators by Difficulty ----------

// ===== DIFFICULTY 1: Tek haneli toplama/çıkarma =====
const easyAddSub: QuestionGenerator = () => {
  const a = rand(2, 9);
  const b = rand(2, 9);
  const isAdd = Math.random() > 0.4;
  if (isAdd) {
    return { expression: `${a} + ${b}`, answer: a + b, type: "toplama", difficulty: 1 };
  }
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return { expression: `${big} - ${small}`, answer: big - small, type: "çıkarma", difficulty: 1 };
};

// ===== DIFFICULTY 2: İki haneli işlemler, çarpım tablosu =====
const mediumCalc: QuestionGenerator = () => {
  const type = pick(["add", "sub", "mul"]);
  switch (type) {
    case "add": {
      const a = rand(10, 99);
      const b = rand(10, 99);
      return { expression: `${a} + ${b}`, answer: a + b, type: "toplama", difficulty: 2 };
    }
    case "sub": {
      const a = rand(30, 99);
      const b = rand(10, a - 1);
      return { expression: `${a} - ${b}`, answer: a - b, type: "çıkarma", difficulty: 2 };
    }
    case "mul": {
      const a = rand(2, 9);
      const b = rand(2, 9);
      return { expression: `${a} × ${b}`, answer: a * b, type: "çarpma", difficulty: 2 };
    }
    default:
      return easyAddSub();
  }
};

// ===== DIFFICULTY 3: Çok haneli çarpma/bölme, işlem önceliği, karekök, üs =====

const sqrtCalc: QuestionGenerator = () => {
  // Algoritmik: rastgele tam kare üret
  const root = rand(2, 20);
  const n = root * root;
  return { expression: `√${n}`, answer: root, type: "karekök", difficulty: 3 };
};

const powerCalc: QuestionGenerator = () => {
  // Algoritmik: taban ve üs aralıkları, cevap makul olsun
  const base = rand(2, 9);
  const maxExp = base <= 3 ? rand(2, 5) : base <= 5 ? rand(2, 3) : 2;
  const answer = Math.pow(base, maxExp);
  return { expression: `${base}^${maxExp}`, answer, type: "üs", difficulty: 3 };
};

const hardCalc: QuestionGenerator = () => {
  const type = pick(["mul2x1", "mul2x2", "div3", "mixed", "sqrt", "power", "islem_onceligi"]);
  switch (type) {
    case "mul2x1": {
      const a = rand(11, 30);
      const b = rand(2, 9);
      return { expression: `${a} × ${b}`, answer: a * b, type: "çarpma", difficulty: 3 };
    }
    case "mul2x2": {
      // İki haneli × iki haneli
      const a = rand(11, 25);
      const b = rand(11, 19);
      return { expression: `${a} × ${b}`, answer: a * b, type: "çarpma", difficulty: 3 };
    }
    case "div3": {
      // Üç haneli ÷ tek haneli
      const divisor = rand(2, 9);
      const answer = rand(12, 60);
      const dividend = divisor * answer;
      return { expression: `${dividend} ÷ ${divisor}`, answer, type: "bölme", difficulty: 3 };
    }
    case "mixed": {
      const a = rand(10, 50);
      const b = rand(10, 50);
      const c = rand(5, 20);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        return { expression: `${a} + ${b} - ${c}`, answer: a + b - c, type: "karışık", difficulty: 3 };
      }
      return { expression: `${a} - ${b} + ${c}`, answer: a - b + c, type: "karışık", difficulty: 3 };
    }
    case "islem_onceligi": {
      // a + b × c (işlem önceliği)
      const a = rand(5, 30);
      const b = rand(2, 9);
      const c = rand(2, 9);
      const sub = Math.random() > 0.5;
      if (sub) {
        const answer = a - b * c;
        if (answer < 0) return hardCalc(); // negatif olmasın
        return { expression: `${a} - ${b} × ${c}`, answer, type: "işlem önceliği", difficulty: 3 };
      }
      return { expression: `${a} + ${b} × ${c}`, answer: a + b * c, type: "işlem önceliği", difficulty: 3 };
    }
    case "sqrt":
      return sqrtCalc();
    case "power":
      return powerCalc();
    default:
      return mediumCalc();
  }
};

// ===== DIFFICULTY 4: Yüzde, kesir, oran, denklem, faktöriyel, ters yüzde =====

const ratioCalc: QuestionGenerator = () => {
  const a = rand(2, 12), b = rand(2, 12), multiplier = rand(2, 9);
  return { expression: `${a}:${b} = x:${b * multiplier} → x`, answer: a * multiplier, type: "oran", difficulty: 4 };
};

const equationCalc: QuestionGenerator = () => {
  const a = rand(2, 9), answer = rand(2, 15), b = rand(3, 20);
  const result = a * answer + b;
  return { expression: `${a}x + ${b} = ${result} → x`, answer, type: "denklem", difficulty: 4 };
};

const factorialCalc: QuestionGenerator = () => {
  // Algoritmik: n! veya n!/m! hesapla
  const factVals = [1, 1, 2, 6, 24, 120, 720, 5040]; // 0! to 7!
  const type = pick(["simple", "division", "sum"]);
  switch (type) {
    case "simple": {
      const n = rand(3, 7);
      return { expression: `${n}!`, answer: factVals[n], type: "faktöriyel", difficulty: 4 };
    }
    case "division": {
      const n = rand(5, 7);
      const m = rand(3, n - 1);
      return { expression: `${n}!/${m}!`, answer: factVals[n] / factVals[m], type: "faktöriyel", difficulty: 4 };
    }
    case "sum": {
      const a = rand(3, 5);
      const b = rand(3, 5);
      if (a === b) return factorialCalc();
      return { expression: `${a}! + ${b}!`, answer: factVals[a] + factVals[b], type: "faktöriyel", difficulty: 4 };
    }
    default:
      return { expression: `5!`, answer: 120, type: "faktöriyel", difficulty: 4 };
  }
};

const advancedCalc: QuestionGenerator = () => {
  const type = pick(["percent", "fraction", "complex", "ratio", "equation", "factorial", "ters_yuzde", "kare_toplam", "ikinci_derece"]);
  switch (type) {
    case "percent": {
      // Algoritmik yüzde — geniş aralık
      const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
      const base = rand(2, 50) * 10; // 20-500 arası 10'un katları
      return {
        expression: `${base}'in %${p}'i`,
        answer: (base * p) / 100,
        type: "yüzde",
        difficulty: 4,
      };
    }
    case "fraction": {
      const fracs = [
        { num: 1, den: 2 },
        { num: 1, den: 3 },
        { num: 1, den: 4 },
        { num: 1, den: 5 },
        { num: 2, den: 3 },
        { num: 2, den: 5 },
        { num: 3, den: 4 },
        { num: 3, den: 5 },
        { num: 4, den: 5 },
      ];
      const f = pick(fracs);
      const base = f.den * rand(2, 12);
      return {
        expression: `${base}'nin ${f.num}/${f.den}'${f.den === 2 ? "si" : "ü"}`,
        answer: (base * f.num) / f.den,
        type: "kesir",
        difficulty: 4,
      };
    }
    case "complex": {
      const a = rand(2, 9);
      const b = rand(2, 9);
      const c = rand(2, 7);
      return {
        expression: `${a} × ${b} + ${c}²`,
        answer: a * b + c * c,
        type: "karışık",
        difficulty: 4,
      };
    }
    case "ters_yuzde": {
      // "%X'i Y olan sayı kaçtır?" → Y / (X/100) = Y * 100/X
      const p = pick([10, 20, 25, 50]);
      const answer = rand(4, 40) * (100 / p); // tam sayı çıksın
      const part = (answer * p) / 100;
      return {
        expression: `%${p}'i ${part} olan sayı`,
        answer,
        type: "ters yüzde",
        difficulty: 4,
      };
    }
    case "kare_toplam": {
      const a = rand(5, 15);
      const b = rand(3, 10);
      return {
        expression: `${a}² + ${b}²`,
        answer: a * a + b * b,
        type: "kare toplamı",
        difficulty: 4,
      };
    }
    case "ikinci_derece": {
      // x² = N → x
      const x = rand(4, 20);
      return {
        expression: `x² = ${x * x} → x`,
        answer: x,
        type: "denklem",
        difficulty: 4,
      };
    }
    case "ratio":
      return ratioCalc();
    case "equation":
      return equationCalc();
    case "factorial":
      return factorialCalc();
    default:
      return hardCalc();
  }
};

// ===== DIFFICULTY 5: YKS — Tamamen algoritmik, tekrarsız =====

/** Algoritmik EBOB: rastgele iki sayı üret, GCD > 1 garanti */
const ebobCalc: QuestionGenerator = () => {
  // Ortak böleni garanti etmek için: gcd * rand1, gcd * rand2
  const g = rand(2, 15);
  const m1 = rand(2, 15);
  const m2 = rand(2, 15);
  if (m1 === m2) return ebobCalc(); // aynı sayı olmasın
  const a = g * m1;
  const b = g * m2;
  return { expression: `EBOB(${a}, ${b})`, answer: gcd(a, b), type: "ebob", difficulty: 5 };
};

/** Algoritmik EKOK */
const ekokCalc: QuestionGenerator = () => {
  const a = rand(4, 30);
  const b = rand(4, 30);
  if (a === b) return ekokCalc();
  const answer = lcm(a, b);
  if (answer > 500) return ekokCalc(); // çok büyük olmasın
  return { expression: `EKOK(${a}, ${b})`, answer, type: "ekok", difficulty: 5 };
};

/** Algoritmik üçgen alanı: taban × yükseklik / 2 */
const triangleCalc: QuestionGenerator = () => {
  const taban = rand(5, 30);
  let yukseklik = rand(4, 20);
  // Tam sayı alan garantisi
  if ((taban * yukseklik) % 2 !== 0) {
    yukseklik = yukseklik % 2 === 0 ? yukseklik : yukseklik + 1;
  }
  const alan = (taban * yukseklik) / 2;
  return { expression: `Taban ${taban}, yükseklik ${yukseklik} → alan`, answer: alan, type: "üçgen", difficulty: 5 };
};

/** Pisagor üçlüsü: (m²-n², 2mn, m²+n²) formülü ile sonsuz üçlü */
const pisagorCalc: QuestionGenerator = () => {
  const m = rand(2, 8);
  const n = rand(1, m - 1);
  const a = m * m - n * n;
  const b = 2 * m * n;
  const c = m * m + n * n;

  const type = pick(["find_c", "find_a", "find_b"]);
  switch (type) {
    case "find_c":
      return { expression: `a=${a}, b=${b} → c=? (Pisagor)`, answer: c, type: "pisagor", difficulty: 5 };
    case "find_a":
      return { expression: `b=${b}, c=${c} → a=? (Pisagor)`, answer: a, type: "pisagor", difficulty: 5 };
    default:
      return { expression: `a=${a}, c=${c} → b=? (Pisagor)`, answer: b, type: "pisagor", difficulty: 5 };
  }
};

/** Aritmetik dizi: a₁, a₁+d, a₁+2d, ... → n. terim */
const aritmetikDiziCalc: QuestionGenerator = () => {
  const a1 = rand(1, 20);
  const d = rand(2, 12);
  const n = rand(6, 12);
  const answer = a1 + (n - 1) * d;
  const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d].join(", ");
  return { expression: `${terms}, ... → ${n}. terim`, answer, type: "aritmetik dizi", difficulty: 5 };
};

/** Geometrik dizi: a₁, a₁·r, a₁·r², ... → n. terim */
const geometrikDiziCalc: QuestionGenerator = () => {
  const r = pick([2, 3, -2]);
  const a1 = rand(1, 7);
  const n = rand(4, 7);
  const answer = a1 * Math.pow(r, n - 1);
  if (Math.abs(answer) > 5000) return geometrikDiziCalc();
  const terms = [a1, a1 * r, a1 * r * r].join(", ");
  return { expression: `${terms}, ... → ${n}. terim`, answer, type: "geometrik dizi", difficulty: 5 };
};

/** Küp kök */
const kupKokCalc: QuestionGenerator = () => {
  const root = rand(2, 10);
  const n = root * root * root;
  return { expression: `∛${n}`, answer: root, type: "küp kök", difficulty: 5 };
};

/** Basit logaritma: log_base(value) = ? */
const logCalc: QuestionGenerator = () => {
  const base = pick([2, 3, 5, 10]);
  const exp = rand(2, base <= 3 ? 6 : base <= 5 ? 4 : 5);
  const value = Math.pow(base, exp);
  if (value > 10000) return logCalc();
  const baseStr = base === 10 ? "" : `${base}`;
  return { expression: `log${baseStr}(${value})`, answer: exp, type: "logaritma", difficulty: 5 };
};

/** Asal çarpanlara ayırma: n = 2^a × 3^b → a+b veya toplam asal çarpan */
const asalCarpanCalc: QuestionGenerator = () => {
  const primes = [2, 3, 5, 7];
  const p1 = pick(primes);
  const p2 = pick(primes.filter((p) => p !== p1));
  const e1 = rand(1, 4);
  const e2 = rand(1, 3);
  const n = Math.pow(p1, e1) * Math.pow(p2, e2);
  if (n > 1000) return asalCarpanCalc();
  return {
    expression: `${n} = ${p1}ᵃ × ${p2}ᵇ → a+b`,
    answer: e1 + e2,
    type: "asal çarpan",
    difficulty: 5,
  };
};

/** Mod işlemi — genişletilmiş aralık */
const modCalc: QuestionGenerator = () => {
  const a = rand(30, 200);
  const b = rand(3, 17);
  return { expression: `${a} mod ${b}`, answer: a % b, type: "mod", difficulty: 5 };
};

/** Mutlak değer ifadeleri */
const mutlakDegerCalc: QuestionGenerator = () => {
  const a = rand(1, 15);
  const b = rand(1, 15);
  const c = rand(1, 15);
  const d = rand(1, 15);
  return {
    expression: `|${a} - ${b}| + |${c} - ${d}|`,
    answer: Math.abs(a - b) + Math.abs(c - d),
    type: "mutlak değer",
    difficulty: 5,
  };
};

/** Üs kuralları: a^m × a^n = a^(m+n) */
const usKuraliCalc: QuestionGenerator = () => {
  const base = pick([2, 3, 5]);
  const m = rand(2, 5);
  const n = rand(2, 4);
  const type = pick(["carpma", "bolme"]);
  if (type === "carpma") {
    const answer = Math.pow(base, m + n);
    if (answer > 10000) return usKuraliCalc();
    return { expression: `${base}^${m} × ${base}^${n}`, answer, type: "üs kuralı", difficulty: 5 };
  }
  // bölme: a^m / a^n
  if (m <= n) return usKuraliCalc();
  const answer = Math.pow(base, m - n);
  return { expression: `${base}^${m} ÷ ${base}^${n}`, answer, type: "üs kuralı", difficulty: 5 };
};

/** Kare farkı: a² - b² = (a-b)(a+b) → zihinsel hesap stratejisi */
const kareFarkiCalc: QuestionGenerator = () => {
  const a = rand(10, 50);
  const b = rand(5, a - 1);
  return { expression: `${a}² - ${b}²`, answer: a * a - b * b, type: "kare farkı", difficulty: 5 };
};

/** Kare hesaplama (genişletilmiş aralık) */
const squareCalc: QuestionGenerator = () => {
  const n = rand(11, 35);
  return { expression: `${n}²`, answer: n * n, type: "kare", difficulty: 5 };
};

/** Bileşik çok adımlı ifadeler */
const compoundCalc: QuestionGenerator = () => {
  const type = pick(["a", "b", "c", "d"]);
  switch (type) {
    case "a": {
      const n = rand(10, 25);
      const sub = rand(10, 50);
      const div = pick([2, 3, 5, 10]);
      const answer = (n * n - sub) / div;
      if (!Number.isInteger(answer) || answer < 0) return compoundCalc();
      return { expression: `(${n}² - ${sub}) ÷ ${div}`, answer, type: "bileşik", difficulty: 5 };
    }
    case "b": {
      const a = rand(3, 8), b = rand(3, 8), c = rand(2, 9);
      return { expression: `${a} × ${b} + ${c}²`, answer: a * b + c * c, type: "bileşik", difficulty: 5 };
    }
    case "c": {
      // (a + b)² hesaplama
      const a = rand(5, 15), b = rand(3, 10);
      return { expression: `(${a} + ${b})²`, answer: (a + b) * (a + b), type: "bileşik", difficulty: 5 };
    }
    default: {
      // a² × b - c
      const a = rand(3, 12), b = rand(2, 5), c = rand(10, 50);
      const answer = a * a * b - c;
      if (answer < 0) return compoundCalc();
      return { expression: `${a}² × ${b} - ${c}`, answer, type: "bileşik", difficulty: 5 };
    }
  }
};

/** Ana YKS zorluk üretici — tüm tipler algoritmik */
const yksCalc: QuestionGenerator = () => {
  const type = pick([
    "ebob", "ekok", "ucgen", "pisagor",
    "aritmetik_dizi", "geometrik_dizi",
    "kup_kok", "log", "asal_carpan",
    "mod", "mutlak", "us_kurali",
    "kare_farki", "square", "compound",
  ]);
  switch (type) {
    case "ebob": return ebobCalc();
    case "ekok": return ekokCalc();
    case "ucgen": return triangleCalc();
    case "pisagor": return pisagorCalc();
    case "aritmetik_dizi": return aritmetikDiziCalc();
    case "geometrik_dizi": return geometrikDiziCalc();
    case "kup_kok": return kupKokCalc();
    case "log": return logCalc();
    case "asal_carpan": return asalCarpanCalc();
    case "mod": return modCalc();
    case "mutlak": return mutlakDegerCalc();
    case "us_kurali": return usKuraliCalc();
    case "kare_farki": return kareFarkiCalc();
    case "square": return squareCalc();
    case "compound": return compoundCalc();
    default: return advancedCalc();
  }
};

// ---------- Public API ----------

const generators: Record<number, QuestionGenerator> = {
  1: easyAddSub,
  2: mediumCalc,
  3: hardCalc,
  4: advancedCalc,
  5: yksCalc,
};

export function generateMathQuestion(difficulty: number): MathQuestion {
  const gen = generators[Math.max(1, Math.min(5, difficulty))] || easyAddSub;
  return gen();
}

export function generateMathQuestionSet(count: number, difficulty: number): MathQuestion[] {
  return Array.from({ length: count }, () => generateMathQuestion(difficulty));
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Kolay",
  2: "Orta",
  3: "Zor",
  4: "İleri",
  5: "YKS",
};

export const DIFFICULTY_DESCRIPTIONS: Record<number, string> = {
  1: "Tek haneli toplama ve çıkarma",
  2: "İki haneli işlemler, çarpım tablosu",
  3: "Çok haneli çarpma/bölme, işlem önceliği, karekök, üs",
  4: "Yüzde, kesir, oran-orantı, denklem, faktöriyel, ters yüzde",
  5: "EBOB-EKOK, Pisagor, logaritma, dizi, asal çarpan, küp kök, çok adımlı",
};
