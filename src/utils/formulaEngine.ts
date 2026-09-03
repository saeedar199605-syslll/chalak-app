/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formula Engine & KPI Auto-Calculation Module
 * Handles safe mathematical expression evaluation, variable substitutions,
 * threshold mapping to 1-5 scale, and validation.
 */

import { Criterion, KpiCalculationType, KpiScoreThresholds } from '../types';

export interface EvaluationFormulaResult {
  computedValue: number;       // Raw calculated value (e.g. 102.5%)
  score: number;               // Standard 1 to 5 rating
  status: 'excellent' | 'good' | 'acceptable' | 'warning' | 'critical';
  statusLabel: string;
  summaryText: string;
  error?: string;
}

/**
 * Default standard thresholds for KPI scoring
 */
export const DEFAULT_KPI_THRESHOLDS: KpiScoreThresholds = {
  score5: 105, // >= 105% => Score 5 (Outstanding)
  score4: 95,  // >= 95%  => Score 4 (Exceeds Target)
  score3: 85,  // >= 85%  => Score 3 (Meets Target)
  score2: 70,  // >= 70%  => Score 2 (Needs Improvement)
  // < 70% => Score 1 (Unacceptable)
};

/**
 * Reverse thresholds for metrics where lower is better (e.g. scrap percentage, cycle time delay)
 */
export const DEFAULT_INVERSE_THRESHOLDS: KpiScoreThresholds = {
  score5: 1.0,  // <= 1.0% scrap => Score 5
  score4: 2.5,  // <= 2.5% scrap => Score 4
  score3: 5.0,  // <= 5.0% scrap => Score 3
  score2: 8.0,  // <= 8.0% scrap => Score 2
  // > 8% => Score 1
};

/**
 * Safely evaluates a basic mathematical expression with variable substitution
 * Supports +, -, *, /, %, ^, (, ), numbers and variable identifiers.
 * Prevents arbitrary code execution without using eval().
 */
export function safeEvaluateMath(expression: string, variables: Record<string, number>): { result: number; error?: string } {
  try {
    if (!expression || !expression.trim()) {
      return { result: 0, error: 'فرمول خالی است.' };
    }

    let cleanExpr = expression.trim();

    // Replace variable names (case-insensitive) with their numerical values
    // Sort keys by length descending to prevent partial variable name collision
    const sortedKeys = Object.keys(variables).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const val = variables[key];
      const safeVal = (typeof val === 'number' && !isNaN(val) && isFinite(val)) ? val : 0;
      // Match variable as whole word
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      cleanExpr = cleanExpr.replace(regex, `(${safeVal})`);
    }

    // Sanity check: expression must only contain numbers, spaces, parentheses, decimal points, and allowed operators
    if (!/^[\d\s+\-*/().^%]+$/.test(cleanExpr)) {
      return { result: 0, error: 'فرمول حاوی کاراکترهای غیرمجاز یا متغیرهای تعریف‌نشده است.' };
    }

    // Normalize power operator ^ to Math.pow representation or simple token parser
    // Use an isolated Function constructor that only returns arithmetic result with no global scope
    const sanitizedEval = new Function(`
      "use strict";
      try {
        const res = (${cleanExpr});
        if (typeof res !== 'number' || isNaN(res) || !isFinite(res)) {
          return 0;
        }
        return res;
      } catch (e) {
        return 0;
      }
    `);

    const evalResult = Number(sanitizedEval());
    return { result: evalResult };
  } catch (err: any) {
    return { result: 0, error: err?.message || 'خطا در ارزیابی محاسباتی فرمول' };
  }
}

/**
 * Computes the KPI value and maps it to a 1-5 performance rating
 */
export function calculateKpiScore(
  criterion: Criterion,
  inputValues: Record<string, number | undefined>
): EvaluationFormulaResult {
  const calcType: KpiCalculationType = criterion.calculationType || 'ratio';
  const dir = criterion.dir || 'more';
  const thresholds = criterion.scoreThresholds || (dir === 'less' ? DEFAULT_INVERSE_THRESHOLDS : DEFAULT_KPI_THRESHOLDS);

  // Clean numerical inputs with fallback to 0 or default
  const sanitizedInputs: Record<string, number> = {};
  if (criterion.variables && criterion.variables.length > 0) {
    criterion.variables.forEach(v => {
      const raw = inputValues[v.key];
      const num = typeof raw === 'number' && !isNaN(raw) ? raw : (Number(raw) || v.defaultValue || 0);
      sanitizedInputs[v.key] = num;
    });
  } else {
    // Standard default variables
    ['actual', 'target', 'standard', 'scrap', 'total', 'value'].forEach(k => {
      const raw = inputValues[k];
      sanitizedInputs[k] = typeof raw === 'number' && !isNaN(raw) ? raw : (Number(raw) || 0);
    });
  }

  let computedValue = 0;
  let formulaDesc = '';

  switch (calcType) {
    case 'ratio': {
      // (actual / target) * 100
      const actual = sanitizedInputs.actual ?? (sanitizedInputs.produced ?? 0);
      const target = sanitizedInputs.target ?? (criterion.targetValue || 100);
      if (target <= 0) {
        computedValue = actual > 0 ? 100 : 0;
      } else {
        computedValue = (actual / target) * 100;
      }
      formulaDesc = `تحقق برنامه: (${actual} از تارگت ${target}) = ${computedValue.toFixed(1)}%`;
      break;
    }

    case 'inverse_ratio': {
      // (standard / actual) * 100 (e.g. Cycle Time - lower actual is better)
      const actual = sanitizedInputs.actual ?? (sanitizedInputs.cycle_time ?? 0);
      const standard = sanitizedInputs.standard ?? (criterion.targetValue || 60);
      if (actual <= 0) {
        computedValue = 100;
      } else {
        computedValue = (standard / actual) * 100;
      }
      formulaDesc = `راندمان زمان چرخه: (استاندارد ${standard}s / واقعی ${actual}s) = ${computedValue.toFixed(1)}%`;
      break;
    }

    case 'defect_rate': {
      // 100 - (scrap / total) * 100
      const scrap = sanitizedInputs.scrap ?? (sanitizedInputs.defects ?? 0);
      const total = sanitizedInputs.total ?? (sanitizedInputs.actual ?? 100);
      const scrapRate = total > 0 ? (scrap / total) * 100 : 0;
      computedValue = Math.max(0, 100 - scrapRate);
      formulaDesc = `کیفیت تولید: نرخ ضایعات ${scrapRate.toFixed(2)}% (سالم: ${computedValue.toFixed(2)}%)`;
      break;
    }

    case 'custom_formula': {
      const expr = criterion.formulaExpression || '(actual / target) * 100';
      const evalRes = safeEvaluateMath(expr, sanitizedInputs);
      if (evalRes.error) {
        return {
          computedValue: 0,
          score: 1,
          status: 'critical',
          statusLabel: 'خطا در فرمول',
          summaryText: `خطا در فرمول شاخص: ${evalRes.error}`,
          error: evalRes.error
        };
      }
      computedValue = evalRes.result;
      formulaDesc = `محاسبه طبق فرمول [${expr}] = ${computedValue.toFixed(2)}`;
      break;
    }

    case 'direct_score':
    default: {
      const direct = sanitizedInputs.value ?? (sanitizedInputs.score ?? 3);
      const bounded = Math.min(5, Math.max(1, Math.round(direct)));
      return {
        computedValue: bounded,
        score: bounded,
        status: bounded >= 4 ? 'excellent' : (bounded === 3 ? 'acceptable' : 'warning'),
        statusLabel: bounded >= 4 ? 'عالی' : (bounded === 3 ? 'متوسط' : 'نیاز به بهبود'),
        summaryText: `امتیاز مستقیم ثبت‌شده: ${bounded} از ۵`
      };
    }
  }

  // Round computed value to 2 decimal places
  computedValue = Math.round(computedValue * 100) / 100;

  // Convert to 1-5 scale based on direction and thresholds
  let score = 3;
  let status: EvaluationFormulaResult['status'] = 'acceptable';
  let statusLabel = 'متوسط / منطبق بر انتظار';

  if (dir === 'less') {
    // For less is better (e.g., lower scrap rate or PPM)
    if (computedValue <= thresholds.score5) {
      score = 5;
      status = 'excellent';
      statusLabel = 'فوق‌العاده (فراتر از برنامه)';
    } else if (computedValue <= thresholds.score4) {
      score = 4;
      status = 'good';
      statusLabel = 'بسیار خوب و مطلوب';
    } else if (computedValue <= thresholds.score3) {
      score = 3;
      status = 'acceptable';
      statusLabel = 'منطبق بر هدف استاندارد';
    } else if (computedValue <= thresholds.score2) {
      score = 2;
      status = 'warning';
      statusLabel = 'نیاز به بهبود و اصلاح فرآیند';
    } else {
      score = 1;
      status = 'critical';
      statusLabel = 'غیرقابل قبول و بحرانی';
    }
  } else {
    // For more is better (standard efficiency %, volume, OEE)
    if (computedValue >= thresholds.score5) {
      score = 5;
      status = 'excellent';
      statusLabel = 'فوق‌العاده (فراتر از برنامه)';
    } else if (computedValue >= thresholds.score4) {
      score = 4;
      status = 'good';
      statusLabel = 'بسیار خوب و مطلوب';
    } else if (computedValue >= thresholds.score3) {
      score = 3;
      status = 'acceptable';
      statusLabel = 'منطبق بر هدف استاندارد';
    } else if (computedValue >= thresholds.score2) {
      score = 2;
      status = 'warning';
      statusLabel = 'نیاز به بهبود و آموزش';
    } else {
      score = 1;
      status = 'critical';
      statusLabel = 'غیرقابل قبول و بحرانی';
    }
  }

  return {
    computedValue,
    score,
    status,
    statusLabel,
    summaryText: `${formulaDesc} | نمره ارزیابی: ${score} از ۵ (${statusLabel})`
  };
}
