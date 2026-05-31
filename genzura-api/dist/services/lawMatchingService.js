/**
 * Law Matching Service
 * Uses Claude AI to match Rwandan laws to cases
 */
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
/**
 * Main function to match Rwandan laws to a case
 */
export async function matchLawsToCase(caseDetails) {
    try {
        // 1. Retrieve relevant laws from database based on case type
        const relevantLaws = await fetchRelevantLawsByType(caseDetails.type);
        if (relevantLaws.length === 0) {
            console.warn(`No laws found for case type: ${caseDetails.type}`);
            return [];
        }
        // 2. Format laws for Claude
        const lawsContext = formatLawsForClaude(relevantLaws);
        // 3. Call Claude to analyze and match
        const matches = await callClaudeForMatching(caseDetails, lawsContext);
        return matches;
    }
    catch (error) {
        console.error('Error matching laws to case:', error);
        throw error;
    }
}
/**
 * Fetch relevant laws from database based on case type
 */
async function fetchRelevantLawsByType(caseType) {
    // Fetch legal articles that are applicable to this case type
    const articles = await prisma.legalArticle.findMany({
        where: {
            applicableTo: {
                has: caseType,
            },
            legalCode: {
                status: 'Active', // Only active laws
            },
        },
        include: {
            legalCode: {
                select: {
                    id: true,
                    code: true,
                    shortName: true,
                    titleEN: true,
                    type: true,
                },
            },
        },
        take: 50, // Limit to prevent context overflow
    });
    return articles;
}
/**
 * Format laws into a string for Claude's context
 */
function formatLawsForClaude(laws) {
    return laws
        .map((article) => `
[${article.legalCode.shortName} - Article ${article.articleNumber}]
Title: ${article.title || 'N/A'}
Code: ${article.legalCode.code}
Type: ${article.legalCode.type}

Legal Text (English):
${article.textEN || 'No English translation available'}

Summary: ${article.summary || 'N/A'}
Keywords: ${article.keywords.join(', ')}
${article.penaltyMin ? `Penalty: ${article.penaltyMin} to ${article.penaltyMax}` : ''}
${article.fineMin ? `Fine: RWF ${article.fineMin.toLocaleString()} ${article.fineMax ? `to ${article.fineMax.toLocaleString()}` : ''}` : ''}

---
`)
        .join('\n');
}
/**
 * Call Claude API to analyze case and match relevant laws
 */
async function callClaudeForMatching(caseDetails, lawsContext) {
    const systemPrompt = `You are a legal expert specializing in Rwandan law. Your task is to analyze case details and identify which Rwandan laws and articles are most relevant.

For each law you identify:
1. Explain WHY it applies to this specific case
2. Rate its relevance: "Primary" (directly applicable), "Secondary" (related/supporting), or "Referenced" (tangentially related)
3. Provide a confidence score (0-100) for how certain you are this law applies

Be precise and only suggest laws that genuinely apply to the case facts provided.`;
    const userPrompt = `# CASE DETAILS

**Case Title:** ${caseDetails.title}
**Case Type:** ${caseDetails.type}
**Priority:** ${caseDetails.priority || 'Not specified'}
**Description:**
${caseDetails.description}

${caseDetails.clientInfo ? `**Client Information:** ${caseDetails.clientInfo}` : ''}

---

# RWANDAN LAWS DATABASE

${lawsContext}

---

# YOUR TASK

Analyze the case and identify ALL relevant Rwandan laws and articles from the database above.

For EACH relevant law/article, respond in this exact JSON format:

{
  "matches": [
    {
      "articleNumber": "168",
      "legalCode": "LAW_N_68_2018_PENAL_CODE",
      "relevance": "Primary",
      "reasoning": "The case involves unauthorized taking of property which directly falls under the definition of simple theft.",
      "confidence": 95
    }
  ]
}

Return ONLY valid JSON. Do not include any explanatory text outside the JSON structure.`;
    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-6', // Using Sonnet for cost efficiency
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
        });
        // Parse Claude's response
        const responseText = message.content[0].type === 'text'
            ? message.content[0].text
            : '';
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No valid JSON found in Claude response');
            return [];
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const matches = [];
        // Map Claude's response to our database IDs
        for (const match of parsed.matches || []) {
            // Find the article in our database
            const article = await prisma.legalArticle.findFirst({
                where: {
                    articleNumber: match.articleNumber,
                    legalCode: {
                        code: match.legalCode,
                    },
                },
                include: {
                    legalCode: true,
                },
            });
            if (article) {
                matches.push({
                    legalCodeId: article.legalCodeId,
                    legalArticleId: article.id,
                    relevance: match.relevance,
                    reasoning: match.reasoning,
                    confidence: match.confidence,
                });
            }
        }
        return matches;
    }
    catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}
/**
 * Save matched laws to a case
 */
export async function saveLawsToCase(caseId, matches, userId) {
    const createdLinks = [];
    for (const match of matches) {
        const caseLaw = await prisma.caseLaw.create({
            data: {
                caseId,
                legalCodeId: match.legalCodeId,
                legalArticleId: match.legalArticleId,
                relevance: match.relevance,
                notes: match.reasoning,
                suggestedBy: 'AI',
                confirmedBy: userId,
            },
            include: {
                legalCode: {
                    select: {
                        shortName: true,
                        titleEN: true,
                    },
                },
                legalArticle: {
                    select: {
                        articleNumber: true,
                        title: true,
                    },
                },
            },
        });
        createdLinks.push(caseLaw);
    }
    return createdLinks;
}
/**
 * Complete flow: Match and save laws to a case
 */
export async function matchAndSaveLaws(caseId, caseDetails, userId) {
    // 1. Match laws using AI
    const matches = await matchLawsToCase(caseDetails);
    // 2. Filter high-confidence matches (>70%)
    const highConfidenceMatches = matches.filter((m) => m.confidence >= 70);
    // 3. Save to database
    const savedLaws = await saveLawsToCase(caseId, highConfidenceMatches, userId);
    return {
        totalMatches: matches.length,
        savedMatches: savedLaws.length,
        laws: savedLaws,
    };
}
/**
 * Get all laws linked to a case
 */
export async function getCaseLaws(caseId) {
    return await prisma.caseLaw.findMany({
        where: { caseId },
        include: {
            legalCode: {
                select: {
                    code: true,
                    shortName: true,
                    titleEN: true,
                    type: true,
                },
            },
            legalArticle: {
                select: {
                    articleNumber: true,
                    title: true,
                    textEN: true,
                    summary: true,
                    keywords: true,
                    penaltyMin: true,
                    penaltyMax: true,
                    fineMin: true,
                    fineMax: true,
                },
            },
        },
        orderBy: {
            relevance: 'asc', // Primary first
        },
    });
}
//# sourceMappingURL=lawMatchingService.js.map