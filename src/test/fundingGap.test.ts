import { describe, it, expect } from 'vitest';
import { ContinuityIntelligence } from '../services/continuityIntelligence';
import { GeminiService } from '../services/geminiService';

describe('ContinuityIntelligence Innovation Modules', () => {
  it('correctly calculates multi-year compounded education inflation and funding gaps', () => {
    const result = ContinuityIntelligence.calculateFundingGap({
      remainingYears: 2,
      annualTuition: 300000,
      annualLivingExpense: 100000,
      annualInflationRate: 10, // 10% inflation
      existingSavingsDedicated: 200000,
      otherScholarshipsOrAid: 0,
      currentInsuranceCoverageLimit: 500000,
    });

    // Year 1: (3L + 1L) * 1.0^0 = 4,00,000
    // Year 2: (3L + 1L) * 1.10^1 = 4,40,000
    // Total future cost: 8,40,000
    expect(result.totalEstimatedFutureCost).toBe(840000);
    expect(result.yearlyBreakdown.length).toBe(2);
    expect(result.yearlyBreakdown[0].totalAnnualCost).toBe(400000);
    expect(result.yearlyBreakdown[1].totalAnnualCost).toBe(440000);

    // Available resources = 2,00,000
    // Coverage = 5,00,000
    // Protected = 7,00,000
    // Net shortfall = 8,40,000 - 7,00,000 = 1,40,000
    expect(result.netUncoveredFundingGap).toBe(140000);
    expect(result.gapSeverity).toBe('moderate_gap');
    expect(result.recommendedCoverageAdjustment).toBe(140000);
  });

  it('identifies fully covered scenario when insurance + savings exceed future costs', () => {
    const result = ContinuityIntelligence.calculateFundingGap({
      remainingYears: 1,
      annualTuition: 200000,
      annualLivingExpense: 50000,
      annualInflationRate: 5,
      existingSavingsDedicated: 100000,
      otherScholarshipsOrAid: 50000,
      currentInsuranceCoverageLimit: 200000,
    });

    expect(result.totalEstimatedFutureCost).toBe(250000);
    // 100k + 50k + 200k = 350k > 250k
    expect(result.netUncoveredFundingGap).toBe(0);
    expect(result.gapSeverity).toBe('fully_covered');
  });

  it('provides explainable clause citations in the AI Policy Assistant', () => {
    const answer = ContinuityIntelligence.queryPolicyAssistant('What is the waiting period?');
    expect(answer.citedClause).toContain('Clause 3.1');
    expect(answer.answer).toContain('30 days');

    const payoutQuery = ContinuityIntelligence.queryPolicyAssistant('How does the university get paid?');
    expect(payoutQuery.citedClause).toContain('Section 7.2');
    expect(payoutQuery.answer).toContain('NEFT/RTGS');
  });

  it('handles offline AI fallback gracefully without throwing errors', async () => {
    // When Gemini API is not configured or fails, GeminiService seamlessly falls back to ContinuityIntelligence
    const response = await GeminiService.queryPolicyAssistant('What are the standard exclusions?');
    expect(response.answer).toBeDefined();
    expect(response.citedClause).toBeDefined();
    expect(response.disclaimer).toBeDefined();
  });
});
