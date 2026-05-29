# 🇷🇼 Where to Get Rwandan Laws

## Official Sources (100% Authentic)

### 1. Amategeko Portal ⭐⭐⭐ BEST OFFICIAL SOURCE
**URL:** https://www.amategeko.gov.rw/

**What It Is:**
- **Official Government Portal** for Rwandan Laws and Case Laws
- Comprehensive database of all Rwandan legislation
- Searchable by law type, year, and keyword
- Includes case law and judicial precedents

**How to Use:**
1. Go to https://www.amategeko.gov.rw/
2. Browse by category or use search
3. Select the law you need
4. View/download full text

**Why This is EXCELLENT:**
- ✅ Official government portal
- ✅ Up-to-date legislation
- ✅ All major codes available
- ✅ Free access
- ✅ Searchable database
- ✅ Kinyarwanda, English, French

**Perfect for your project!** This is likely the single best source for Rwandan laws.

---

### 2. Rwanda Official Gazette
**URL:** https://www.primature.gov.rw/index.php?id=331

**How to Use:**
1. Go to the Prime Minister's website
2. Click "Publications" → "Official Gazette"
3. Browse by year
4. Download PDF of specific laws

**What You'll Find:**
- Complete text of all enacted laws
- Published in Kinyarwanda, English, French
- Official legal reference numbers

---

### 2. Ministry of Justice (MINIJUST)
**URL:** https://www.minijust.gov.rw/

**Navigation:**
- Go to: Home → Publications → Laws

**Major Codes Available:**
- ✅ Penal Code (2018) - Law N° 68/2018
- ✅ Civil Code
- ✅ Commercial Code
- ✅ Land Code - Law N° 32/2015
- ✅ Labor Code - Law N° 66/2018

---

### 3. Rwanda Law Reform Commission
**URL:** https://www.rlrc.gov.rw/

**What They Have:**
- Consolidated versions of laws
- Law reform reports
- Legal research

---

## International Legal Databases (Easier Access)

### 4. AfricanLII ⭐ EASIEST TO USE
**URL:** https://www.africanlii.org/rw/

**Why Use This:**
- ✅ Free and searchable
- ✅ Well-organized by topic
- ✅ English translations available
- ✅ Easy to copy text for your database

**Direct Links:**

**Penal Code 2018:**
https://www.africanlii.org/rw/legislation/act/2018/68

**Labor Code 2018:**
https://www.africanlii.org/rw/legislation/act/2018/66

**Land Code 2015:**
https://www.africanlii.org/rw/legislation/act/2015/32

**Civil Code (Book III - Obligations):**
https://www.africanlii.org/rw/legislation/act/1988/2

---

### 5. Refworld (UNHCR Legal Database)
**URL:** https://www.refworld.org/country/RWA.html

**Good For:**
- Legal context
- Human rights laws
- Refugee/immigration law

---

### 6. World Bank - Doing Business
**URL:** https://archive.doingbusiness.org/en/data/exploreeconomies/rwanda

**Laws Covered:**
- Commercial regulations
- Contract enforcement
- Property registration

---

## 📋 Priority Laws to Add First

### 1. **Penal Code 2018** (Law N° 68/2018)
**Why:** Most litigation cases reference this
**Articles to Prioritize:**
- Theft (Art. 168-170)
- Fraud (Art. 264-268)
- Assault (Art. 135-142)
- Property damage (Art. 175-179)

**Download From:**
- AfricanLII: https://www.africanlii.org/rw/legislation/act/2018/68
- Official Gazette: Search "Law N° 68/2018"

---

### 2. **Labor Code 2018** (Law N° 66/2018)
**Why:** Employment cases are common
**Articles to Prioritize:**
- Employment contracts (Art. 27-33)
- Termination (Art. 36-41)
- Working hours (Art. 73-77)
- Leave entitlements (Art. 78-85)

**Download From:**
- AfricanLII: https://www.africanlii.org/rw/legislation/act/2018/66
- MINIJUST website

---

### 3. **Land Code 2015** (Law N° 32/2015)
**Why:** Property disputes are frequent
**Articles to Prioritize:**
- Land ownership (Art. 3-7)
- Land registration (Art. 16-24)
- Land transactions (Art. 25-34)
- Expropriation (Art. 52-65)

**Download From:**
- AfricanLII: https://www.africanlii.org/rw/legislation/act/2015/32
- Rwanda Land Management and Use Authority: https://www.rlma.rw/

---

### 4. **Commercial Code 2021** (Law N° 45/2021)
**Why:** Corporate and contract cases
**Articles to Prioritize:**
- Contract formation (Art. 10-25)
- Breach of contract (Art. 40-58)
- Commercial obligations (Art. 60-80)
- Company formation (Art. 100-150)

**Download From:**
- Official Gazette 2021
- MINIJUST website

---

### 5. **Intellectual Property Law 2009** (Law N° 31/2009)
**Why:** Growing tech/creative sector
**Articles to Prioritize:**
- Patents (Art. 1-50)
- Trademarks (Art. 51-100)
- Copyright (Art. 140-180)
- Industrial designs (Art. 101-139)

**Download From:**
- AfricanLII
- Rwanda Development Board (IP section)

---

### 6. **Company Law 2021** (Law N° 007/2021)
**Why:** Corporate cases and M&A
**Download From:**
- Rwanda Development Board: https://www.rdb.rw/
- Official Gazette

---

### 7. **Tax Code** (Various Laws)
**Why:** Tax disputes
**Download From:**
- Rwanda Revenue Authority: https://www.rra.gov.rw/
- Section: Legislation

---

### 8. **Family Code 2016** (Law N° 32/2016)
**Why:** Family law cases
**Articles to Prioritize:**
- Marriage (Art. 1-30)
- Divorce (Art. 31-50)
- Child custody (Art. 51-70)
- Inheritance (Art. 71-100)

---

## 🛠️ How to Extract and Add Laws

### Step 1: Download the Law
Go to AfricanLII or Official Gazette and download PDF/HTML

### Step 2: Extract Articles
Open the document and identify articles relevant to case types you handle

### Step 3: Format for Database
For each article, you need:
- Article number (e.g., "168")
- Title (e.g., "Simple Theft")
- Full text in English (and Kinyarwanda if available)
- Summary in plain language
- Keywords (e.g., ["theft", "property", "stolen"])
- Applicable case types (e.g., [CaseType.Litigation])
- Penalties (if criminal law)

### Step 4: Add to Seed File
Edit `prisma/seeds/rwandanLaws.ts` and add:

```typescript
await prisma.legalArticle.create({
  data: {
    legalCodeId: penalCode.id, // Reference the legal code
    articleNumber: '171',
    chapter: 'Chapter II',
    section: 'Section 3: Theft with Violence',
    title: 'Armed Robbery',
    textEN: 'Any person who commits theft using a weapon or while carrying a weapon commits armed robbery and is liable to imprisonment for a term of seven (7) to ten (10) years.',
    textKY: 'Umuntu wese wiba akoresheje intwaro cyangwa afite intwaro ahanishwa igifungo cy\'imyaka irindwi (7) kugeza ku myaka icumi (10).',
    summary: 'Defines armed robbery as theft committed with a weapon, with higher penalties than simple or aggravated theft',
    keywords: ['armed robbery', 'weapon', 'theft', 'violence'],
    applicableTo: [CaseType.Litigation],
    penaltyMin: '7 years',
    penaltyMax: '10 years',
  },
});
```

### Step 5: Re-run Seed
```bash
npx ts-node prisma/seeds/rwandanLaws.ts
```

---

## 📥 Quick Start Example

### Example: Adding Penal Code Article 168 (Simple Theft)

**1. Go to AfricanLII:**
https://www.africanlii.org/rw/legislation/act/2018/68

**2. Find Article 168:**
```
Article 168: Theft

Any person who fraudulently takes property belonging to another 
commits theft and is liable to imprisonment for a term of not less 
than six (6) months and not more than two (2) years and a fine...
```

**3. Add to your seed file:**
```typescript
{
  legalCodeId: penalCode.id,
  articleNumber: '168',
  title: 'Simple Theft',
  textEN: 'Any person who fraudulently takes property belonging to another commits theft and is liable to imprisonment for a term of not less than six (6) months and not more than two (2) years and a fine of not less than one hundred thousand (100,000) and not more than five hundred thousand (500,000) Rwandan francs.',
  summary: 'Defines simple theft as taking another person\'s property',
  keywords: ['theft', 'stolen property', 'fraudulent taking'],
  applicableTo: [CaseType.Litigation],
  penaltyMin: '6 months',
  penaltyMax: '2 years',
  fineMin: 100000,
  fineMax: 500000,
}
```

---

## 🤖 Pro Tip: Use Claude to Help Format

You can use Claude Code to help extract and format laws!

**Example prompt:**
```
I have this legal article from Rwanda Penal Code:

[Paste article text here]

Format it for my Prisma seed file with:
- articleNumber
- title
- textEN
- summary
- keywords (array)
- applicable case types
- penalties
```

Claude will format it perfectly for your database! 🎯

---

## 📞 Contact Legal Institutions

If you need official copies or clarifications:

**Ministry of Justice:**
- Email: info@minijust.gov.rw
- Phone: +250 788 185 555

**Rwanda Law Reform Commission:**
- Email: info@rlrc.gov.rw
- Website: https://www.rlrc.gov.rw/

**Rwanda Bar Association:**
- Can provide guidance on legal references
- Website: https://rwandabar.org.rw/

---

## ⚖️ Legal Disclaimer

When using these sources:
1. ✅ Always verify with official gazette for court citations
2. ✅ Check for amendments and updates
3. ✅ Cite the official law number and gazette reference
4. ✅ Note if using English translations vs original Kinyarwanda

---

## 🎯 Recommended Approach

**Phase 1: Start Small** (Week 1)
- Add top 20-30 most common articles
- Focus on: Penal Code (theft, fraud), Labor Code (termination), Land Code (ownership)

**Phase 2: Expand by Practice Area** (Month 1)
- Add complete sections relevant to your cases
- Employment law, contract law, property law

**Phase 3: Comprehensive Coverage** (Ongoing)
- Gradually add all major codes
- Update as new laws are enacted

---

**Need help extracting and formatting laws? I can help you process any legal text you paste here!** 📚
