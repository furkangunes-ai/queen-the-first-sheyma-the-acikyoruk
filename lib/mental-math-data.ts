// Mental Math Question Generation

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

// ---------- Generators by Difficulty ----------

// Difficulty 1: Single digit add/subtract
const easyAddSub: QuestionGenerator = () => {
  const a = rand(2, 9);
  const b = rand(2, 9);
  const isAdd = Math.random() > 0.4;
  if (isAdd) {
    return { expression: `${a} + ${b}`, answer: a + b, type: "toplama", difficulty: 1 };
  }
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return { expression: `${big} - ${small}`, answer: big - small, type: "cikarma", difficulty: 1 };
};

// Difficulty 2: Two digit add/subtract, single digit multiply
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
      return { expression: `${a} - ${b}`, answer: a - b, type: "cikarma", difficulty: 2 };
    }
    case "mul": {
      const a = rand(2, 9);
      const b = rand(2, 9);
      return { expression: `${a} \u00d7 ${b}`, answer: a * b, type: "carpma", difficulty: 2 };
    }
    default:
      return easyAddSub();
  }
};

// Difficulty 3: Two digit multiply, simple division, mixed, square root, powers
const sqrtCalc: QuestionGenerator = () => {
  const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 324, 400];
  const n = pick(perfectSquares);
  return { expression: `\u221a${n}`, answer: Math.sqrt(n), type: "karekok", difficulty: 3 };
};

const powerCalc: QuestionGenerator = () => {
  const bases: [number, number][] = [[2, rand(3,8)], [3, rand(2,4)], [5, rand(2,3)], [4, 3], [6, 2], [7, 2], [8, 2], [9, 2]];
  const [base, exp] = pick(bases);
  return { expression: `${base}^${exp}`, answer: Math.pow(base, exp), type: "us", difficulty: 3 };
};

const hardCalc: QuestionGenerator = () => {
  const type = pick(["mul2", "div", "mixed", "sqrt", "power"]);
  switch (type) {
    case "mul2": {
      const a = rand(11, 25);
      const b = rand(2, 9);
      return { expression: `${a} \u00d7 ${b}`, answer: a * b, type: "carpma", difficulty: 3 };
    }
    case "div": {
      const b = rand(2, 12);
      const answer = rand(3, 15);
      const a = b * answer;
      return { expression: `${a} \u00f7 ${b}`, answer, type: "bolme", difficulty: 3 };
    }
    case "mixed": {
      const a = rand(10, 50);
      const b = rand(10, 50);
      const c = rand(5, 20);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        return { expression: `${a} + ${b} - ${c}`, answer: a + b - c, type: "karisik", difficulty: 3 };
      }
      return { expression: `${a} - ${b} + ${c}`, answer: a - b + c, type: "karisik", difficulty: 3 };
    }
    case "sqrt":
      return sqrtCalc();
    case "power":
      return powerCalc();
    default:
      return mediumCalc();
  }
};

// Difficulty 4: Percentage, fraction, complex, ratio, equation, factorial
const ratioCalc: QuestionGenerator = () => {
  const a = rand(2, 8), b = rand(2, 8), multiplier = rand(2, 7);
  return { expression: `${a}:${b} = x:${b * multiplier} \u2192 x`, answer: a * multiplier, type: "oran", difficulty: 4 };
};

const equationCalc: QuestionGenerator = () => {
  const a = rand(2, 7), answer = rand(2, 10), b = rand(3, 15);
  const result = a * answer + b;
  return { expression: `${a}x + ${b} = ${result} \u2192 x`, answer, type: "denklem", difficulty: 4 };
};

const factorialCalc: QuestionGenerator = () => {
  const factorials: [string, number][] = [["5!", 120], ["4!", 24], ["6!/4!", 30], ["5!/3!", 20], ["6!/5!", 6], ["7!/6!", 7], ["3!+4!", 30]];
  const [expr, ans] = pick(factorials);
  return { expression: expr, answer: ans, type: "faktoriyel", difficulty: 4 };
};

const advancedCalc: QuestionGenerator = () => {
  const type = pick(["percent", "fraction", "complex", "ratio", "equation", "factorial"]);
  switch (type) {
    case "percent": {
      const percents = [10, 20, 25, 50, 75];
      const p = pick(percents);
      const base = pick([40, 60, 80, 100, 120, 200, 250, 300, 400, 500]);
      return {
        expression: `${base}'in %${p}'i`,
        answer: (base * p) / 100,
        type: "yuzde",
        difficulty: 4,
      };
    }
    case "fraction": {
      const fracs = [
        { num: 1, den: 2 },
        { num: 1, den: 3 },
        { num: 1, den: 4 },
        { num: 2, den: 3 },
        { num: 3, den: 4 },
      ];
      const f = pick(fracs);
      const base = f.den * rand(2, 8);
      return {
        expression: `${base}'nin ${f.num}/${f.den}'${f.den === 2 ? "si" : f.den === 3 ? "\u00fc" : "\u00fc"}`,
        answer: (base * f.num) / f.den,
        type: "kesir",
        difficulty: 4,
      };
    }
    case "complex": {
      const a = rand(2, 9);
      const b = rand(2, 9);
      const c = rand(2, 5);
      return {
        expression: `${a} \u00d7 ${b} + ${c * c}`,
        answer: a * b + c * c,
        type: "karisik",
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

// Difficulty 5: EBOB-EKOK style, multi-step, YKS-level, triangle, geometric sequence, modular, compound
const triangleCalc: QuestionGenerator = () => {
  const triangles: [string, number][] = [
    ["3-4-5 \u00fc\u00e7genin alan\u0131", 6],
    ["5-12-13 \u00fc\u00e7genin alan\u0131", 30],
    ["6-8-10 \u00fc\u00e7genin alan\u0131", 24],
    ["8-15-17 \u00fc\u00e7genin alan\u0131", 60],
    ["Taban 10, y\u00fckseklik 6 \u2192 alan", 30],
    ["Taban 12, y\u00fckseklik 5 \u2192 alan", 30],
    ["Taban 7, y\u00fckseklik 8 \u2192 alan", 28],
  ];
  const [expr, ans] = pick(triangles);
  return { expression: expr, answer: ans, type: "ucgen", difficulty: 5 };
};

const geometricCalc: QuestionGenerator = () => {
  const r = pick([2, 3]);
  const a1 = pick([2, 3, 5]);
  const n = rand(4, 6);
  const answer = a1 * Math.pow(r, n - 1);
  const terms = [a1, a1*r, a1*r*r].join(", ");
  return { expression: `${terms}, ... \u2192 ${n}. terim`, answer, type: "dizi", difficulty: 5 };
};

const modCalc: QuestionGenerator = () => {
  const a = rand(30, 99), b = rand(3, 11);
  return { expression: `${a} mod ${b}`, answer: a % b, type: "mod", difficulty: 5 };
};

const squareCalc: QuestionGenerator = () => {
  const n = rand(11, 25);
  return { expression: `${n}\u00b2`, answer: n * n, type: "kare", difficulty: 5 };
};

const compoundCalc: QuestionGenerator = () => {
  const type = pick(["a", "b", "c"]);
  switch (type) {
    case "a": {
      const n = rand(10, 20);
      const sub = rand(10, 50);
      const div = pick([2, 5, 10]);
      const answer = (n * n - sub) / div;
      if (!Number.isInteger(answer) || answer < 0) return compoundCalc();
      return { expression: `(${n}\u00b2 - ${sub}) / ${div}`, answer, type: "bilesik", difficulty: 5 };
    }
    case "b": {
      const a = rand(2, 5), b = rand(2, 5), c = rand(2, 9);
      return { expression: `${a} \u00d7 ${b} + ${c}\u00b2`, answer: a * b + c * c, type: "bilesik", difficulty: 5 };
    }
    default: {
      const a = rand(10, 30), b = rand(10, 30);
      return { expression: `${a}\u00b2 - ${b}\u00b2`, answer: a*a - b*b, type: "bilesik", difficulty: 5 };
    }
  }
};

const yksCalc: QuestionGenerator = () => {
  const type = pick(["ebob", "ekok", "square", "multi", "triangle", "geometric", "mod", "squareCalc", "compound"]);
  switch (type) {
    case "ebob": {
      // GCD of two numbers
      const pairs = [
        [12, 18],
        [24, 36],
        [15, 25],
        [20, 30],
        [28, 42],
        [36, 48],
        [16, 24],
        [30, 45],
        [21, 35],
        [18, 27],
      ];
      const [a, b] = pick(pairs);
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      return {
        expression: `EBOB(${a}, ${b})`,
        answer: gcd(a, b),
        type: "ebob",
        difficulty: 5,
      };
    }
    case "ekok": {
      // LCM of two numbers
      const pairs = [
        [4, 6],
        [6, 8],
        [3, 5],
        [8, 12],
        [9, 12],
        [10, 15],
        [6, 10],
        [4, 10],
        [5, 8],
        [6, 9],
      ];
      const [a, b] = pick(pairs);
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      return {
        expression: `EKOK(${a}, ${b})`,
        answer: (a * b) / gcd(a, b),
        type: "ekok",
        difficulty: 5,
      };
    }
    case "square": {
      const n = rand(11, 25);
      return {
        expression: `${n}\u00b2`,
        answer: n * n,
        type: "kare",
        difficulty: 5,
      };
    }
    case "multi": {
      const a = rand(11, 25);
      const b = rand(2, 5);
      const c = rand(10, 30);
      return {
        expression: `${a} \u00d7 ${b} - ${c}`,
        answer: a * b - c,
        type: "karisik",
        difficulty: 5,
      };
    }
    case "triangle":
      return triangleCalc();
    case "geometric":
      return geometricCalc();
    case "mod":
      return modCalc();
    case "squareCalc":
      return squareCalc();
    case "compound":
      return compoundCalc();
    default:
      return advancedCalc();
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
  4: "Ileri",
  5: "YKS",
};

export const DIFFICULTY_DESCRIPTIONS: Record<number, string> = {
  1: "Tek haneli toplama ve cikarma",
  2: "Iki haneli islemler, carpim tablosu",
  3: "Iki haneli carpma, bolme, karisik, karekok, us hesaplama",
  4: "Yuzde, kesir, karmasik islemler, oran-oranti, denklem, faktoriyel",
  5: "EBOB-EKOK, kare hesaplama, ucgen alani, geometrik dizi, mod, bilesik islemler",
};
