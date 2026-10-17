/**
 * iCoded LeadPilot — Transparent Lead Scoring Engine (PRD Section 7.5)
 * Score 0-100 based on 5 configurable dimensions:
 * 1. Target-Sector Fit (0–25)
 * 2. Service Opportunity Evidence (0–25)
 * 3. Reachability (0–15)
 * 4. Digital Presence Improvement Opportunity (0–20)
 * 5. Freshness & Verification (0–15)
 */

export function calculateLeadScore(lead, customWeights = null) {
  const explanations = [];
  let sectorScore = 0;
  let opportunityScore = 0;
  let reachabilityScore = 0;
  let digitalScore = 0;
  let freshnessScore = 0;

  // 1. Target-Sector Fit (0-25)
  const cat = (lead.category || '').toLowerCase();
  if (cat.includes('clinic') || cat.includes('dental') || cat.includes('skin') || cat.includes('hospital') || cat.includes('physio') || cat.includes('health')) {
    sectorScore = 25;
    explanations.push('High-priority sector: Healthcare / Clinic aligns with iCoded appointment automation & patient portal offer (+25)');
  } else if (cat.includes('coaching') || cat.includes('education') || cat.includes('academy') || cat.includes('institute') || cat.includes('school')) {
    sectorScore = 22;
    explanations.push('High-priority sector: Education / Coaching matches student CRM and enquiry automation (+22)');
  } else if (cat.includes('gym') || cat.includes('salon') || cat.includes('spa') || cat.includes('travel') || cat.includes('hotel') || cat.includes('real estate')) {
    sectorScore = 18;
    explanations.push('Target sector: Local service business with high lead generation potential (+18)');
  } else if (cat.includes('software') || cat.includes('manufacturing') || cat.includes('logistics') || cat.includes('b2b')) {
    sectorScore = 17;
    explanations.push('Target sector: Industrial / B2B suitable for custom ERP/HRMS solutions (+17)');
  } else {
    sectorScore = 12;
    explanations.push('General commercial category (+12)');
  }

  // 2. Service Opportunity Evidence (0-25)
  const opportunities = lead.opportunityTypes || [];
  const evidence = lead.opportunityEvidence || [];
  
  if (evidence.length > 0) {
    const pointsPerEvidence = Math.min(25, evidence.length * 8);
    opportunityScore = pointsPerEvidence;
    explanations.push(`${evidence.length} documented opportunity signal(s): ${evidence.slice(0, 2).join('; ')} (+${pointsPerEvidence})`);
  } else if (!lead.businessWebsite) {
    opportunityScore = 16;
    explanations.push('No public website observed in verified sources — opportunity for modern web presence (+16)');
  } else {
    opportunityScore = 10;
    explanations.push('Baseline service opportunity review pending (+10)');
  }

  // 3. Business Reachability (0-15)
  let reachPoints = 0;
  if (lead.businessPhone && lead.businessPhone.trim().length > 6) {
    reachPoints += 8;
    explanations.push('Direct business contact phone verified (+8)');
  }
  if (lead.address && lead.locality) {
    reachPoints += 4;
    explanations.push('Complete physical locality & address documented (+4)');
  }
  if (lead.publicBusinessEmail) {
    reachPoints += 3;
    explanations.push('Lawfully obtained public business email recorded (+3)');
  }
  reachabilityScore = Math.min(15, reachPoints);

  // 4. Digital Presence Improvement Opportunity (0-20)
  let digPoints = 0;
  if (!lead.businessWebsite) {
    digPoints += 14;
    explanations.push('Opportunity for complete website & digital booking architecture (+14)');
  } else {
    // If website exists, check review count and rating
    if (lead.rating && lead.rating < 4.2) {
      digPoints += 8;
      explanations.push(`Public rating (${lead.rating}) suggests opportunity for reputation & review campaign (+8)`);
    }
    if (lead.reviewCount !== undefined && lead.reviewCount < 25) {
      digPoints += 6;
      explanations.push(`Low review volume (${lead.reviewCount || 0} reviews) indicates need for Google Business Profile growth (+6)`);
    }
    if (digPoints === 0) {
      digPoints = 8;
      explanations.push('Website present — candidate for WhatsApp automation & performance marketing (+8)');
    }
  }
  digitalScore = Math.min(20, digPoints);

  // 5. Freshness & Verification (0-15)
  let freshPoints = 0;
  if (lead.lastVerifiedAt || lead.discoveredAt) {
    freshPoints += 8;
    explanations.push('Recently discovered and timestamped (+8)');
  }
  if (lead.dataQualityStatus === 'Verified') {
    freshPoints += 7;
    explanations.push('Human verified by sales team (+7)');
  } else {
    freshPoints += 3;
    explanations.push('Automated provider discovery record (+3)');
  }
  freshnessScore = Math.min(15, freshPoints);

  const totalScore = Math.min(100, Math.max(0, sectorScore + opportunityScore + reachabilityScore + digitalScore + freshnessScore));

  let calculatedPriority = 'Cold';
  if (totalScore >= 75) calculatedPriority = 'Hot';
  else if (totalScore >= 50) calculatedPriority = 'Warm';
  else if (totalScore < 30) calculatedPriority = 'Unqualified';

  return {
    score: totalScore,
    priority: calculatedPriority,
    breakdown: {
      targetSectorFit: sectorScore,
      serviceOpportunityEvidence: opportunityScore,
      businessReachability: reachabilityScore,
      digitalPresenceOpportunity: digitalScore,
      freshnessVerification: freshnessScore,
      explanations
    }
  };
}
