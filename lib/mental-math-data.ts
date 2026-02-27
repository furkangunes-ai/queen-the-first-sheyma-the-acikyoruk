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

// Difficulty 3: Two digit multiply, simple division, mixed
const hardCalc: QuestionGenerator = () => {
  const type = pick(["mul2", "div", "mixed"]);
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
    default:
      return mediumCalc();
  }
};

// Difficulty 4: Percentage, fraction, complex
const advancedCalc: QuestionGenerator = () => {
  const type = pick(["percent", "fraction", "complex"]);
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
    default:
      return hardCalc();
  }
};

// Difficulty 5: EBOB-EKOK style, multi-step, YKS-level
const yksCalc: QuestionGenerator = () => {
  const type = pick(["ebob", "ekok", "square", "multi"]);
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
  3: "Iki haneli carpma, bolme, karisik",
  4: "Yuzde, kesir, karmasik islemler",
  5: "EBOB-EKOK, kare hesaplama, cok adimli",
};
