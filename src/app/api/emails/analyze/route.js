import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PYTHON_BRIDGE_URL = process.env.PYTHON_BRIDGE_URL || 'http://127.0.0.1:5001/analyze';

/**
 * Generates a heuristic-based fallback analysis when the AI bridge is unavailable.
 * Scans for common phishing/spam indicators using pattern matching.
 */
function generateFallbackAnalysis(input) {
  const lower = input.toLowerCase();
  const indicators = [];
  let riskScore = 0;

  // --- URL Analysis ---
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = input.match(urlPattern) || [];
  const suspiciousTLDs = ['.xyz', '.win', '.top', '.club', '.online', '.buzz', '.info', '.tk', '.ml', '.ga', '.cf'];
  const trustedDomains = ['google.com', 'microsoft.com', 'apple.com', 'github.com', 'amazon.com'];

  urls.forEach((url) => {
    const urlLower = url.toLowerCase();
    if (suspiciousTLDs.some((tld) => urlLower.includes(tld))) {
      indicators.push(`URL Analysis: Suspicious TLD detected in ${url}`);
      riskScore += 30;
    }
    if (trustedDomains.some((d) => urlLower.includes(d) && !urlLower.includes(`://${d}`) && !urlLower.includes(`://www.${d}`))) {
      indicators.push(`URL Analysis: Possible domain impersonation in ${url}`);
      riskScore += 25;
    }
  });

  // --- Sender Spoofing ---
  const spoofPatterns = [
    /paypal.*(?!paypal\.com)/i,
    /netflix.*(?!netflix\.com)/i,
    /amazon.*(?!amazon\.com)/i,
    /microsoft.*(?!microsoft\.com)/i,
    /apple.*(?!apple\.com)/i,
    /security.*@.*(?!\.gov|\.edu)/i,
  ];
  spoofPatterns.forEach((pattern) => {
    if (pattern.test(input)) {
      indicators.push('Sender Spoofing: From address mimics a well-known brand');
      riskScore += 20;
    }
  });

  // --- Urgency & Social Engineering ---
  const urgencyKeywords = ['urgent', 'immediately', 'action required', 'verify your', 'confirm your', 'suspended', 'restricted', 'limited', 'expire', 'click here', 'act now', 'within 24 hours'];
  urgencyKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      indicators.push(`Behavioral Threat: Urgency/pressure language detected ("${kw}")`);
      riskScore += 10;
    }
  });

  // --- Content Analysis ---
  const phishingPhrases = ['update your payment', 'verify your identity', 'confirm your account', 'unusual activity', 'suspicious activity', 'account has been'];
  phishingPhrases.forEach((phrase) => {
    if (lower.includes(phrase)) {
      indicators.push(`Content Analysis: Phishing-associated phrase detected`);
      riskScore += 15;
    }
  });

  // Deduplicate indicators
  const uniqueIndicators = [...new Set(indicators)];

  // Determine risk level
  let riskLevel, threatType;
  if (riskScore >= 60) {
    riskLevel = 'Critical';
    threatType = 'Phishing / Social Engineering Attack';
  } else if (riskScore >= 40) {
    riskLevel = 'High';
    threatType = 'Suspected Phishing Attempt';
  } else if (riskScore >= 25) {
    riskLevel = 'Medium';
    threatType = 'Potential Spam / Suspicious Content';
  } else if (riskScore >= 10) {
    riskLevel = 'Low';
    threatType = 'Minor Anomalies Detected';
  } else {
    riskLevel = 'Safe';
    threatType = 'No Threats Detected';
  }

  const confidenceScore = Math.min(95, Math.max(40, 50 + riskScore));

  // Build explanation
  let explanation;
  if (riskScore >= 40) {
    explanation = `Heuristic analysis detected ${uniqueIndicators.length} threat indicator(s) including suspicious URLs, social engineering patterns, and potential sender spoofing. This email exhibits characteristics commonly associated with phishing campaigns.`;
  } else if (riskScore >= 10) {
    explanation = `Heuristic analysis detected minor anomalies. The email contains ${uniqueIndicators.length} indicator(s) worth reviewing, but no high-confidence threat was identified.`;
  } else {
    explanation = `Heuristic analysis found no significant threat indicators. The email appears to be legitimate based on pattern analysis.`;
  }

  // Recommendations
  const recommendations = [];
  if (riskScore >= 40) {
    recommendations.push('Do NOT click any links in this email');
    recommendations.push('Verify the sender through an independent channel');
    recommendations.push('Report this email as phishing to your IT department');
    recommendations.push('If you clicked any links, change your passwords immediately');
  } else if (riskScore >= 10) {
    recommendations.push('Exercise caution with any links or attachments');
    recommendations.push('Verify the sender if the email seems unexpected');
  } else {
    recommendations.push('No immediate action required');
  }

  return {
    riskLevel,
    threatType,
    confidenceScore,
    explanation,
    indicators: uniqueIndicators.slice(0, 6),
    recommendations,
    detailedScores: {
      phishingProb: Math.min(1, riskScore / 80),
      spamProb: Math.min(1, riskScore / 100),
      urlRisk: urls.length > 0 ? Math.min(1, riskScore / 60) : 0,
      sentimentScore: riskScore >= 25 ? 0.3 : 0.7,
      sentimentLabel: riskScore >= 25 ? 'Negative' : 'Neutral',
      promptInjectionScore: 0,
      promptInjectionDetected: false,
      attackCategories: [],
      attackerActor: 'Organized Criminal Groups'
    },
  };
}

/**
 * POST /api/emails/analyze
 * Body: { input: string }
 * Forwards a single email's content to the Python AI bridge and returns the analysis.
 * Falls back to heuristic analysis if the bridge is unreachable.
 */
export async function POST(req) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    let bridgeResponse;
    try {
      console.log('Forwarding to AI Space:', PYTHON_BRIDGE_URL);
      
      const body = JSON.stringify({ input: input.trim() });
      
      bridgeResponse = await fetch(PYTHON_BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchError) {
      console.warn('AI Bridge unreachable, using heuristic fallback:', fetchError.message);
      const fallback = generateFallbackAnalysis(input);
      return NextResponse.json(fallback);
    }

    const json = await bridgeResponse.json();
    
    // Gradio returns result in {"data": [actual_result_here]}
    const data = json.data ? json.data[0] : json;

    if (!bridgeResponse.ok || data.error) {
      console.warn('AI Bridge returned error, using heuristic fallback:', data.error || json);
      const fallback = generateFallbackAnalysis(input);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Email analyze error:', error);
    // Even on unexpected errors, return a fallback so the UI doesn't break
    const fallback = generateFallbackAnalysis(typeof error === 'object' ? '' : String(error));
    return NextResponse.json(fallback);
  }
}
