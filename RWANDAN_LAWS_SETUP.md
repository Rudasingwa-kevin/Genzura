# 🇷🇼 Rwandan Laws Database Setup Guide

This guide explains how to set up the Rwandan legal database in Genzura and use AI to match laws to cases.

## 📋 What Was Added

### 1. **Database Schema** (`prisma/schema.prisma`)

New models for storing Rwandan laws:

- ✅ `LegalCode` - Legal codes/laws (Penal Code, Labor Code, etc.)
- ✅ `LegalArticle` - Individual articles within each code
- ✅ `LegalCodeRelation` - Relationships between codes
- ✅ `LegalArticleRelation` - Relationships between articles
- ✅ `LegalAmendment` - Track amendments to laws
- ✅ `CaseLaw` - Link cases to applicable laws (with AI suggestions)

### 2. **Seed Data** (`prisma/seeds/rwandanLaws.ts`)

Sample Rwandan laws included:
- **Penal Code 2018** - Theft, fraud, criminal offenses
- **Commercial Code 2021** - Business contracts, commercial disputes
- **Labor Code 2018** - Employment contracts, termination, workers' rights
- **Land Code 2015** - Property ownership, land registration
- **IP Law 2009** - Patents, copyright, trademarks

### 3. **Law Matching Service** (`src/services/lawMatchingService.ts`)

AI-powered service to automatically match Rwandan laws to cases using Claude Sonnet 4.6.

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd genzura-api
npm install @anthropic-ai/sdk
```

### Step 2: Add Anthropic API Key

Add to your `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.anthropic.com

### Step 3: Generate and Run Migration

```bash
# Generate Prisma migration
npx prisma migrate dev --name add_rwandan_laws

# This will:
# 1. Create the new database tables
# 2. Update Prisma Client
```

### Step 4: Seed the Database

```bash
# Run the seed script
npx ts-node prisma/seeds/rwandanLaws.ts
```

You should see:
```
🇷🇼 Seeding Rwandan Legal Database...
✅ Rwandan Legal Database seeded successfully!
   - 5 Legal Codes
   - 13 Legal Articles
```

---

## 🎯 How to Use

### 1. **Automatically Match Laws When Creating a Case**

```typescript
import { matchAndSaveLaws } from './services/lawMatchingService';

// In your case creation controller
const newCase = await prisma.case.create({
  data: {
    title: 'Theft of Company Property',
    type: 'Litigation',
    description: 'Employee stole laptop from office at night...',
    // ... other fields
  }
});

// Auto-match laws with AI
const result = await matchAndSaveLaws(
  newCase.id,
  {
    title: newCase.title,
    type: newCase.type,
    description: newCase.description,
  },
  userId // Attorney who created the case
);

console.log(`Matched ${result.savedMatches} relevant laws`);
```

### 2. **Get Laws for a Case**

```typescript
import { getCaseLaws } from './services/lawMatchingService';

const laws = await getCaseLaws(caseId);

// Returns array of matched laws with:
// - Legal code info
// - Article details
// - AI reasoning
// - Relevance (Primary/Secondary/Referenced)
```

### 3. **Manual Law Matching**

```typescript
import { matchLawsToCase } from './services/lawMatchingService';

const matches = await matchLawsToCase({
  title: 'Contract Dispute',
  type: 'Corporate',
  description: 'Client claims breach of commercial agreement...',
});

// Review matches before saving
matches.forEach(match => {
  console.log(`Confidence: ${match.confidence}%`);
  console.log(`Reasoning: ${match.reasoning}`);
});
```

---

## 📊 Database Structure

### Case → Laws Relationship

```
Case
  ├─ applicableLaws[] (CaseLaw)
      ├─ legalCode (e.g., "Penal Code 2018")
      ├─ legalArticle (e.g., "Article 168 - Simple Theft")
      ├─ relevance ("Primary" | "Secondary" | "Referenced")
      ├─ notes (AI reasoning)
      ├─ suggestedBy ("AI" | userId)
      └─ confirmedBy (userId)
```

### Querying Case Laws

```typescript
const caseWithLaws = await prisma.case.findUnique({
  where: { id: caseId },
  include: {
    applicableLaws: {
      include: {
        legalCode: true,
        legalArticle: true,
      },
    },
  },
});
```

---

## 🎨 Frontend Integration Example

Display matched laws on the Case Detail Page:

```typescript
// In CaseDetailPage.tsx
const [applicableLaws, setApplicableLaws] = useState([]);

useEffect(() => {
  // Fetch laws for this case
  fetch(`/api/cases/${caseId}/laws`)
    .then(res => res.json())
    .then(setApplicableLaws);
}, [caseId]);

// Display in UI
<div className="applicable-laws">
  <h3>📜 Applicable Rwandan Laws</h3>
  {applicableLaws.map(law => (
    <div key={law.id} className="law-card">
      <span className="badge">{law.relevance}</span>
      <h4>{law.legalCode.shortName} - Article {law.legalArticle.articleNumber}</h4>
      <p className="law-title">{law.legalArticle.title}</p>
      <p className="law-summary">{law.legalArticle.summary}</p>
      {law.legalArticle.penaltyMin && (
        <p className="penalty">
          ⚖️ Penalty: {law.legalArticle.penaltyMin} to {law.legalArticle.penaltyMax}
        </p>
      )}
      {law.notes && (
        <p className="ai-reasoning">
          <strong>AI Analysis:</strong> {law.notes}
        </p>
      )}
    </div>
  ))}
</div>
```

---

## 💰 Cost Considerations

### Claude Sonnet 4.6 Pricing:
- **Input:** $3 per million tokens
- **Output:** $15 per million tokens

### Estimated Cost Per Case:
- **Single case matching:** ~1,500 input tokens + ~300 output tokens
- **Cost:** ~$0.005 - $0.01 per case (less than 1 cent!)

### Monthly Estimates:
- **100 cases/month:** ~$0.50 - $1.00
- **500 cases/month:** ~$2.50 - $5.00
- **1000 cases/month:** ~$5.00 - $10.00

Very affordable! 🎉

---

## 🔧 Customization

### Add More Laws

Edit `prisma/seeds/rwandanLaws.ts` to add:
- More articles to existing codes
- New legal codes (Tax Code, Environmental Law, etc.)
- Kinyarwanda and French translations

Then re-run: `npx ts-node prisma/seeds/rwandanLaws.ts`

### Change AI Model

In `lawMatchingService.ts`, line 147:

```typescript
// For higher accuracy (more expensive)
model: 'claude-opus-4-7'

// Current setting (balanced)
model: 'claude-sonnet-4-6'

// For lowest cost (less accurate)
model: 'claude-haiku-4-5-20251001'
```

### Adjust Confidence Threshold

In `lawMatchingService.ts`, line 261:

```typescript
// Only save matches above 70% confidence
const highConfidenceMatches = matches.filter((m) => m.confidence >= 70);

// Change to 80 for stricter matching
// Change to 60 for more suggestions
```

---

## 📚 Data Sources for Rwandan Laws

To expand the legal database, get official texts from:

1. **Rwanda Official Gazette**
   - https://www.primature.gov.rw/index.php?id=331

2. **Ministry of Justice**
   - https://www.minijust.gov.rw/

3. **Parliament of Rwanda**
   - https://www.parliament.gov.rw/

4. **AfricanLII (African Legal Information Institute)**
   - https://www.africanlii.org/rw/

5. **Lexadin (World Law Guide)**
   - https://www.lexadin.nl/wlg/legis/nofr/oeur/lxwerwa.htm

---

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY not found"
- Make sure `.env` file has `ANTHROPIC_API_KEY=...`
- Restart your server after adding the key

### Error: "No laws found for case type"
- Run seed script: `npx ts-node prisma/seeds/rwandanLaws.ts`
- Check that laws have the correct `applicableTo` case types

### AI returns empty matches
- Increase confidence threshold
- Add more detailed case descriptions
- Check that relevant laws exist for that case type

### Migration fails
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Try: `npx prisma migrate reset` (⚠️ clears data)

---

## ✅ Next Steps

1. ✅ Run migration: `npx prisma migrate dev --name add_rwandan_laws`
2. ✅ Seed database: `npx ts-node prisma/seeds/rwandanLaws.ts`
3. ✅ Get Anthropic API key from https://console.anthropic.com
4. ✅ Add `ANTHROPIC_API_KEY` to `.env`
5. ✅ Test law matching with a sample case
6. ✅ Integrate into case creation flow
7. ✅ Display matched laws in case detail page
8. 📈 Gradually add more Rwandan laws to the database

---

## 📞 Support

Need help? Check:
- Anthropic API docs: https://docs.anthropic.com/
- Prisma docs: https://www.prisma.io/docs
- Claude Code: https://claude.ai/code

---

**Made with ❤️ for Genzura**
