# 🏗️ Law Matching System Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      GENZURA LEGAL SYSTEM                        │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
│                                                                     │
│  ┌─────────────────┐         ┌──────────────────┐                 │
│  │ Case Creation   │         │ Case Detail Page │                 │
│  │ Form            │────────▶│ + Laws Display   │                 │
│  └─────────────────┘         └──────────────────┘                 │
│         │                              │                           │
│         │ POST /api/cases              │ GET /api/cases/:id/laws   │
│         ▼                              ▼                           │
└─────────┼──────────────────────────────┼───────────────────────────┘
          │                              │
          │                              │
┌─────────┼──────────────────────────────┼───────────────────────────┐
│         │        BACKEND (Node.js/Express)           │              │
│         ▼                              ▼                           │
│  ┌─────────────────┐         ┌──────────────────┐                 │
│  │ Case Controller │         │ Law Controller   │                 │
│  └────────┬────────┘         └────────┬─────────┘                 │
│           │                           │                            │
│           │ createCase()              │ getCaseLaws()              │
│           ▼                           │                            │
│  ┌─────────────────────────────────────────────────┐              │
│  │      LAW MATCHING SERVICE                       │              │
│  │                                                  │              │
│  │  ┌──────────────────────────────────────────┐  │              │
│  │  │ 1. Fetch relevant laws from database    │  │              │
│  │  │    (based on case type)                  │  │              │
│  │  └──────────────┬───────────────────────────┘  │              │
│  │                 ▼                                │              │
│  │  ┌──────────────────────────────────────────┐  │              │
│  │  │ 2. Format laws + case details for AI    │  │              │
│  │  └──────────────┬───────────────────────────┘  │              │
│  │                 ▼                                │              │
│  │  ┌──────────────────────────────────────────┐  │              │
│  │  │ 3. Send to Claude Sonnet 4.6            │──┼──────┐        │
│  │  └──────────────┬───────────────────────────┘  │      │        │
│  │                 ▼                                │      │        │
│  │  ┌──────────────────────────────────────────┐  │      │        │
│  │  │ 4. Parse AI response (matched laws)     │◀─┼──────┘        │
│  │  └──────────────┬───────────────────────────┘  │               │
│  │                 ▼                                │               │
│  │  ┌──────────────────────────────────────────┐  │               │
│  │  │ 5. Save matched laws to database        │  │               │
│  │  └──────────────────────────────────────────┘  │               │
│  └─────────────────────────────────────────────────┘              │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                            │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ LegalCode    │───▶│LegalArticle  │◀───│  CaseLaw     │         │
│  │              │    │              │    │              │         │
│  │ - Penal Code │    │ - Art. 168   │    │ - caseId     │         │
│  │ - Labor Code │    │ - Art. 169   │    │ - articleId  │         │
│  │ - Land Code  │    │ - Art. 270   │    │ - relevance  │         │
│  └──────────────┘    └──────────────┘    │ - reasoning  │         │
│                                           └──────┬───────┘         │
│  ┌──────────────┐                               │                 │
│  │    Case      │◀──────────────────────────────┘                 │
│  │              │                                                  │
│  │ - title      │                                                  │
│  │ - type       │                                                  │
│  │ - description│                                                  │
│  └──────────────┘                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ANTHROPIC CLAUDE API                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Model: Claude Sonnet 4.6                                    │  │
│  │                                                               │  │
│  │  Input: Case details + Rwandan laws                          │  │
│  │  Output: Matched laws with reasoning                         │  │
│  │                                                               │  │
│  │  Cost: ~$0.005-$0.01 per case                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Case Creation to Law Matching

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Attorney Creates Case                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  Case Data:                       │
        │  - Title: "Theft of Laptop"       │
        │  - Type: Litigation               │
        │  - Description: "Employee stole   │
        │    company laptop at night..."    │
        └───────────────┬───────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Fetch Relevant Laws from Database                      │
│                                                                 │
│ Query: Get all LegalArticles where:                            │
│   - applicableTo includes "Litigation"                         │
│   - legalCode.status = "Active"                                │
│                                                                 │
│ Result: 15 articles (Penal Code, Civil Code, etc.)            │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Format Prompt for Claude                               │
│                                                                 │
│ System: "You are a Rwandan legal expert..."                    │
│                                                                 │
│ User Prompt:                                                    │
│   Case: [case details]                                         │
│   Laws: [15 formatted articles]                                │
│   Task: Match relevant laws and explain why                    │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Claude Analyzes Case                                   │
│                                                                 │
│ AI Processing:                                                  │
│ ✓ Reads case description                                       │
│ ✓ Analyzes each law                                            │
│ ✓ Identifies keywords: "stole", "night", "laptop"             │
│ ✓ Matches to Penal Code Article 169 (Aggravated Theft)        │
│ ✓ Confidence: 95%                                              │
│ ✓ Reasoning: "Night time + theft = aggravated"                │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Parse Claude Response                                  │
│                                                                 │
│ JSON Response:                                                  │
│ {                                                               │
│   "matches": [                                                  │
│     {                                                           │
│       "articleNumber": "169",                                   │
│       "legalCode": "LAW_N_68_2018_PENAL_CODE",                 │
│       "relevance": "Primary",                                   │
│       "reasoning": "Night theft is aggravated...",             │
│       "confidence": 95                                          │
│     }                                                           │
│   ]                                                             │
│ }                                                               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Save to Database                                       │
│                                                                 │
│ CaseLaw.create({                                               │
│   caseId: "case123",                                           │
│   legalArticleId: "article_169_id",                            │
│   relevance: "Primary",                                        │
│   notes: "Night theft is aggravated...",                       │
│   suggestedBy: "AI",                                           │
│   confidence: 95                                               │
│ })                                                              │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Display to Attorney                                    │
│                                                                 │
│  ╔═══════════════════════════════════════════════╗             │
│  ║ 📜 Applicable Laws (AI Suggested)             ║             │
│  ╠═══════════════════════════════════════════════╣             │
│  ║                                               ║             │
│  ║ [PRIMARY] Penal Code 2018 - Article 169      ║             │
│  ║ Aggravated Theft                              ║             │
│  ║                                               ║             │
│  ║ Penalty: 2 years - 5 years                   ║             │
│  ║ Fine: RWF 1,000,000+                          ║             │
│  ║                                               ║             │
│  ║ 🤖 AI Analysis:                               ║             │
│  ║ This case involves theft at night, which     ║             │
│  ║ constitutes aggravated theft under Article   ║             │
│  ║ 169 of the Penal Code.                       ║             │
│  ║                                               ║             │
│  ║ [Confirm] [Edit] [Remove]                    ║             │
│  ╚═══════════════════════════════════════════════╝             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                     DATABASE SCHEMA                              │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  LegalCode      │         │  LegalArticle    │
├─────────────────┤         ├──────────────────┤
│ id              │◀───────┤│ id               │
│ code            │       │ │ legalCodeId (FK) │
│ officialTitle   │       │ │ articleNumber    │
│ titleEN         │       │ │ title            │
│ shortName       │       │ │ textEN           │
│ type            │       │ │ textKY           │
│ status          │       │ │ summary          │
│ enactmentDate   │       │ │ keywords[]       │
│ lawNumber       │       │ │ applicableTo[]   │
│ summary         │       │ │ penaltyMin       │
└─────────────────┘       │ │ penaltyMax       │
                          │ │ fineMin          │
                          │ │ fineMax          │
                          │ └──────────────────┘
                          │         │
                          │         │
                          │         ▼
                          │ ┌──────────────────┐
                          │ │    CaseLaw       │
                          │ ├──────────────────┤
┌─────────────────┐       │ │ id               │
│     Case        │       │ │ caseId (FK)      │
├─────────────────┤       │ │ legalCodeId (FK) │
│ id              │◀──────┼─│ legalArticleId   │
│ caseNumber      │       │ │ relevance        │
│ title           │       │ │ notes            │
│ type            │       │ │ suggestedBy      │
│ description     │       │ │ confirmedBy      │
│ status          │       │ │ createdAt        │
│ priority        │       │ └──────────────────┘
│ clientId        │       │         ▲
│ attorneyId      │       │         │
└─────────────────┘       └─────────┘
```

---

## API Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                        API ENDPOINTS                            │
└─────────────────────────────────────────────────────────────────┘


CREATE CASE + AUTO-MATCH LAWS
────────────────────────────────────────────
POST /api/cases
  │
  ├─▶ Create case in database
  │
  └─▶ POST /api/cases/:caseId/match-laws
        │
        ├─▶ lawMatchingService.matchAndSaveLaws()
        │     │
        │     ├─▶ Fetch relevant laws from DB
        │     ├─▶ Call Claude API
        │     ├─▶ Parse response
        │     └─▶ Save to CaseLaw table
        │
        └─▶ Return: { savedMatches: 3, laws: [...] }


GET CASE LAWS
────────────────────────────────────────────
GET /api/cases/:caseId/laws
  │
  ├─▶ Query CaseLaw table
  │     WHERE caseId = :caseId
  │     INCLUDE legalCode, legalArticle
  │
  └─▶ Return: [
        {
          id: "law1",
          relevance: "Primary",
          legalCode: { shortName: "Penal Code 2018" },
          legalArticle: { articleNumber: "169", title: "..." }
        }
      ]


SEARCH LAWS
────────────────────────────────────────────
GET /api/laws/search?q=theft&caseType=Litigation
  │
  ├─▶ Query LegalArticle table
  │     WHERE keywords CONTAINS "theft"
  │     AND applicableTo CONTAINS "Litigation"
  │
  └─▶ Return: [
        {
          articleNumber: "168",
          title: "Simple Theft",
          legalCode: { shortName: "Penal Code 2018" }
        }
      ]


MANUALLY ADD LAW
────────────────────────────────────────────
POST /api/cases/:caseId/laws
Body: { legalArticleId: "art123", relevance: "Primary" }
  │
  ├─▶ Create CaseLaw record
  │     suggestedBy = userId (manual)
  │
  └─▶ Return: { success: true, data: {...} }


UPDATE LAW
────────────────────────────────────────────
PUT /api/cases/:caseId/laws/:lawId
Body: { relevance: "Secondary", notes: "..." }
  │
  ├─▶ Update CaseLaw record
  │     confirmedBy = userId
  │
  └─▶ Return: { success: true, data: {...} }


REMOVE LAW
────────────────────────────────────────────
DELETE /api/cases/:caseId/laws/:lawId
  │
  ├─▶ Delete CaseLaw record
  │
  └─▶ Return: { success: true }
```

---

## Cost Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    COST BREAKDOWN                               │
└─────────────────────────────────────────────────────────────────┘

Per Case Matching Request:
──────────────────────────────────────────────────────────────

Input Tokens:
  • System prompt: 200 tokens
  • Case details: 150 tokens
  • 15 laws × 75 tokens each: 1,125 tokens
  ─────────────────────────────────────
  Total Input: ~1,500 tokens

Output Tokens:
  • Matched laws JSON: ~300 tokens
  ─────────────────────────────────────
  Total Output: ~300 tokens


Cost Calculation (Claude Sonnet 4.6):
──────────────────────────────────────────────────────────

Input:  1,500 tokens × $3 / 1,000,000 = $0.0045
Output:   300 tokens × $15 / 1,000,000 = $0.0045
                                        ─────────
Total per case:                         $0.009 (~1 cent)


Monthly Cost Examples:
──────────────────────────────────────────────────────────

 Cases/Month │ Total Cost
─────────────┼────────────
     100     │  $0.90
     500     │  $4.50
   1,000     │  $9.00
   5,000     │ $45.00
  10,000     │ $90.00


With Claude Haiku 4.5 (cheaper):
──────────────────────────────────────────────────────────

 Cases/Month │ Total Cost
─────────────┼────────────
     100     │  $0.15
     500     │  $0.75
   1,000     │  $1.50
   5,000     │  $7.50
  10,000     │ $15.00
```

---

## File Structure

```
genzura-api/
│
├── prisma/
│   ├── schema.prisma              ← Database schema (MODIFIED)
│   └── seeds/
│       └── rwandanLaws.ts         ← Seed data (NEW)
│
├── src/
│   ├── controllers/
│   │   └── lawController.ts       ← API endpoints (NEW)
│   │
│   ├── routes/
│   │   └── lawRoutes.ts           ← Express routes (NEW)
│   │
│   └── services/
│       └── lawMatchingService.ts  ← AI matching logic (NEW)
│
└── .env                           ← Add ANTHROPIC_API_KEY here
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│          WHERE TO INTEGRATE IN YOUR APP                         │
└─────────────────────────────────────────────────────────────────┘

1. CASE CREATION
   ────────────────────────────────────────────────────
   File: genzura-api/src/controllers/caseController.ts

   async function createCase(req, res) {
     // Create case
     const newCase = await prisma.case.create({...});

     // ✅ ADD THIS: Auto-match laws
     await matchAndSaveLaws(newCase.id, {
       title: newCase.title,
       type: newCase.type,
       description: newCase.description,
     });

     return res.json(newCase);
   }


2. CASE DETAIL PAGE
   ────────────────────────────────────────────────────
   File: genzura-web/src/pages/CaseDetailPage.tsx

   // ✅ ADD THIS: Fetch and display laws
   const [laws, setLaws] = useState([]);

   useEffect(() => {
     fetch(`/api/cases/${caseId}/laws`)
       .then(res => res.json())
       .then(data => setLaws(data.data));
   }, [caseId]);

   // Display laws in UI
   {laws.map(law => <LawCard key={law.id} law={law} />)}


3. APP ROUTES
   ────────────────────────────────────────────────────
   File: genzura-api/src/index.ts

   // ✅ ADD THIS: Register law routes
   import lawRoutes from './routes/lawRoutes';
   app.use('/api', lawRoutes);
```

---

**Ready to implement? Start with the 5-step Quick Start in LAW_MATCHING_SUMMARY.md!** 🚀
