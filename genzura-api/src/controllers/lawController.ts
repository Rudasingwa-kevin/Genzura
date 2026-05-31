/**
 * Law Controller
 * Handles API endpoints for Rwandan law matching
 */

import { Request, Response } from 'express';
import {
  matchLawsToCase,
  matchAndSaveLaws,
  getCaseLaws,
  saveLawsToCase,
} from '../services/lawMatchingService.js';
import { PrismaClient, CaseType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/cases/:caseId/match-laws
 * Automatically match and save laws to a case
 */
export async function matchLawsToCaseEndpoint(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    const userId = req.user?.id; // From auth middleware

    // Fetch case details
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: true,
      },
    });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Match and save laws
    const result = await matchAndSaveLaws(
      caseId,
      {
        title: caseData.title,
        type: caseData.type,
        description: caseData.description,
        priority: caseData.priority,
        clientInfo: caseData.client.name,
      },
      userId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully matched ${result.savedMatches} laws to case`,
      data: {
        totalMatches: result.totalMatches,
        savedMatches: result.savedMatches,
        laws: result.laws,
      },
    });
  } catch (error) {
    console.error('Error matching laws:', error);
    return res.status(500).json({
      error: 'Failed to match laws to case',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/cases/:caseId/laws
 * Get all laws linked to a case
 */
export async function getCaseLawsEndpoint(req: Request, res: Response) {
  try {
    const { caseId } = req.params;

    const laws = await getCaseLaws(caseId);

    return res.status(200).json({
      success: true,
      count: laws.length,
      data: laws,
    });
  } catch (error) {
    console.error('Error fetching case laws:', error);
    return res.status(500).json({
      error: 'Failed to fetch case laws',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/cases/:caseId/laws
 * Manually add a law to a case (attorney can override AI suggestions)
 */
export async function addLawToCaseEndpoint(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    const { legalCodeId, legalArticleId, relevance, notes } = req.body;
    const userId = req.user?.id;

    // Validate inputs
    if (!legalCodeId && !legalArticleId) {
      return res.status(400).json({
        error: 'Either legalCodeId or legalArticleId is required',
      });
    }

    // Create the link
    const caseLaw = await prisma.caseLaw.create({
      data: {
        caseId,
        legalCodeId,
        legalArticleId,
        relevance: relevance || 'Referenced',
        notes,
        suggestedBy: userId, // Manually added by user
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

    return res.status(201).json({
      success: true,
      message: 'Law added to case',
      data: caseLaw,
    });
  } catch (error) {
    console.error('Error adding law to case:', error);
    return res.status(500).json({
      error: 'Failed to add law to case',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /api/cases/:caseId/laws/:lawId
 * Remove a law from a case
 */
export async function removeLawFromCaseEndpoint(req: Request, res: Response) {
  try {
    const { caseId, lawId } = req.params;

    await prisma.caseLaw.delete({
      where: {
        id: lawId,
        caseId, // Ensure law belongs to this case
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Law removed from case',
    });
  } catch (error) {
    console.error('Error removing law from case:', error);
    return res.status(500).json({
      error: 'Failed to remove law from case',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PUT /api/cases/:caseId/laws/:lawId
 * Update law relevance or notes
 */
export async function updateCaseLawEndpoint(req: Request, res: Response) {
  try {
    const { caseId, lawId } = req.params;
    const { relevance, notes } = req.body;
    const userId = req.user?.id;

    const updated = await prisma.caseLaw.update({
      where: {
        id: lawId,
        caseId,
      },
      data: {
        relevance,
        notes,
        confirmedBy: userId, // Mark as reviewed by user
        updatedAt: new Date(),
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

    return res.status(200).json({
      success: true,
      message: 'Case law updated',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating case law:', error);
    return res.status(500).json({
      error: 'Failed to update case law',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/laws/search
 * Search for laws by keyword, article number, or type
 */
export async function searchLawsEndpoint(req: Request, res: Response) {
  try {
    const { q, type, caseType } = req.query;

    const where: any = {
      status: 'Active',
    };

    // Filter by legal code type
    if (type) {
      where.type = type;
    }

    const laws = await prisma.legalArticle.findMany({
      where: {
        legalCode: where,
        ...(q && {
          OR: [
            { title: { contains: q as string, mode: 'insensitive' } },
            { articleNumber: { contains: q as string } },
            { keywords: { has: q as string } },
            { textEN: { contains: q as string, mode: 'insensitive' } },
          ],
        }),
        ...(caseType && {
          applicableTo: { has: caseType as CaseType },
        }),
      },
      include: {
        legalCode: {
          select: {
            code: true,
            shortName: true,
            titleEN: true,
            type: true,
          },
        },
      },
      take: 20, // Limit results
    });

    return res.status(200).json({
      success: true,
      count: laws.length,
      data: laws,
    });
  } catch (error) {
    console.error('Error searching laws:', error);
    return res.status(500).json({
      error: 'Failed to search laws',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/laws/:articleId
 * Get details of a specific legal article
 */
export async function getLegalArticleEndpoint(req: Request, res: Response) {
  try {
    const { articleId } = req.params;

    const article = await prisma.legalArticle.findUnique({
      where: { id: articleId },
      include: {
        legalCode: true,
        relatedArticles: {
          include: {
            toArticle: {
              include: {
                legalCode: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Legal article not found' });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching legal article:', error);
    return res.status(500).json({
      error: 'Failed to fetch legal article',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
