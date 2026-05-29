/**
 * Seed data for Rwandan Legal Database
 * This is a starter set - you'll need to add complete laws from official sources
 */

import { PrismaClient, LegalCodeType, LegalStatus, CaseType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRwandanLaws() {
  console.log('🇷🇼 Seeding Rwandan Legal Database...');

  // ═══════════════════════════════════════════════════════════════════════
  // 1. RWANDAN PENAL CODE (2018)
  // ═══════════════════════════════════════════════════════════════════════
  const penalCode = await prisma.legalCode.upsert({
    where: { code: 'LAW_N_68_2018_PENAL_CODE' },
    update: {},
    create: {
      code: 'LAW_N_68_2018_PENAL_CODE',
      officialTitle: 'Itegeko rigenga icyaha n\'ihazabikorwa ry\'icyaha',
      titleEN: 'Law Determining Offences and Penalties in General',
      titleFR: 'Loi déterminant les infractions et les peines en général',
      shortName: 'Penal Code 2018',
      type: LegalCodeType.Penal_Code,
      status: LegalStatus.Active,
      category: ['Criminal', 'Offences', 'Penalties'],
      enactmentDate: new Date('2018-08-30'),
      effectiveDate: new Date('2019-02-01'),
      officialGazette: 'Official Gazette nº Special of 30/08/2018',
      lawNumber: 'N° 68/2018',
      summary: 'The Rwandan Penal Code establishes criminal offences and their corresponding penalties, including provisions for theft, fraud, assault, and other criminal acts.',
      pdfUrl: 'https://www.migeprof.gov.rw/fileadmin/user_upload/Migeprof/Publications/Laws/PENAL_CODE.pdf',
    },
  });

  // Sample Articles from Penal Code
  await prisma.legalArticle.createMany({
    data: [
      {
        legalCodeId: penalCode.id,
        articleNumber: '168',
        chapter: 'Chapter II',
        section: 'Section 2: Theft',
        title: 'Simple Theft',
        textEN: 'Any person who fraudulently takes property belonging to another commits theft and is liable to imprisonment for a term of not less than six (6) months and not more than two (2) years and a fine of not less than one hundred thousand (100,000) and not more than five hundred thousand (500,000) Rwandan francs.',
        textKY: 'Umuntu wese wiba umutungo w\'undi ahanishwa igifungo cy\'amezi atandatu (6) kugeza ku myaka ibiri (2) n\'ihazabu rigera ku mafaranga ibihumbi ijana (100,000) kugeza kuri ibihumbi magana atanu (500,000) y\'amafaranga y\'u Rwanda.',
        summary: 'Defines simple theft as fraudulently taking another person\'s property',
        keywords: ['theft', 'stolen property', 'fraudulent taking'],
        applicableTo: [CaseType.Litigation],
        penaltyMin: '6 months',
        penaltyMax: '2 years',
        fineMin: 100000,
        fineMax: 500000,
      },
      {
        legalCodeId: penalCode.id,
        articleNumber: '169',
        chapter: 'Chapter II',
        section: 'Section 2: Theft',
        title: 'Aggravated Theft',
        textEN: 'Theft is aggravated and punishable by imprisonment for a term of not less than two (2) years and not more than five (5) years and a fine of not less than one million (1,000,000) Rwandan francs when committed at night, by two or more persons, with violence, or with breaking and entering.',
        textKY: 'Ubujura burakaza iyo bukozwe nijoro, n\'abantu babiri cyangwa barenga, hakoresha urugomo, cyangwa hamenyerewe inzu, kandi ubuhanishwa igifungo cy\'imyaka ibiri (2) kugeza ku myaka itanu (5) n\'ihazabu rigera ku mafaranga miliyoni imwe (1,000,000) y\'amafaranga y\'u Rwanda.',
        summary: 'Defines circumstances that make theft aggravated (at night, multiple people, violence, breaking and entering)',
        keywords: ['aggravated theft', 'breaking and entering', 'violence', 'night theft'],
        applicableTo: [CaseType.Litigation],
        penaltyMin: '2 years',
        penaltyMax: '5 years',
        fineMin: 1000000,
      },
      {
        legalCodeId: penalCode.id,
        articleNumber: '264',
        chapter: 'Chapter III',
        section: 'Section 1: Fraud',
        title: 'Fraud and Obtaining Property by False Pretenses',
        textEN: 'Any person who, through deceit or false pretenses, obtains property, money, or services from another person commits fraud and is liable to imprisonment for a term of not less than one (1) year and not more than three (3) years and a fine.',
        textKY: 'Umuntu wese ubeshya undi kugira ngo abone umutungo, amafaranga cyangwa serivisi ahanishwa igifungo cy\'umwaka umwe (1) kugeza ku myaka itatu (3) n\'ihazabu.',
        summary: 'Criminalizes obtaining property, money, or services through deceit or false pretenses',
        keywords: ['fraud', 'false pretenses', 'deceit', 'obtaining property'],
        applicableTo: [CaseType.Litigation, CaseType.Corporate],
        penaltyMin: '1 year',
        penaltyMax: '3 years',
      },
    ],
    skipDuplicates: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 2. COMMERCIAL CODE
  // ═══════════════════════════════════════════════════════════════════════
  const commercialCode = await prisma.legalCode.upsert({
    where: { code: 'LAW_N_45_2021_COMMERCIAL_CODE' },
    update: {},
    create: {
      code: 'LAW_N_45_2021_COMMERCIAL_CODE',
      officialTitle: 'Itegeko rigenga Ubucuruzi',
      titleEN: 'Law Governing Commercial Activities',
      titleFR: 'Loi régissant les activités commerciales',
      shortName: 'Commercial Code 2021',
      type: LegalCodeType.Commercial_Code,
      status: LegalStatus.Active,
      category: ['Business', 'Commerce', 'Contracts'],
      enactmentDate: new Date('2021-12-20'),
      effectiveDate: new Date('2022-01-01'),
      officialGazette: 'Official Gazette nº Special of 20/12/2021',
      lawNumber: 'N° 45/2021',
      summary: 'Governs commercial transactions, business contracts, company formation, and commercial disputes in Rwanda.',
    },
  });

  await prisma.legalArticle.createMany({
    data: [
      {
        legalCodeId: commercialCode.id,
        articleNumber: '12',
        chapter: 'Chapter I',
        section: 'Formation of Contracts',
        title: 'Valid Contract Requirements',
        textEN: 'A commercial contract is valid when there is: 1) Offer and acceptance, 2) Consideration, 3) Legal capacity of parties, 4) Lawful purpose.',
        textKY: 'Amasezerano y\'ubucuruzi afite agaciro iyo harimo: 1) Icyifuzo n\'iyemera, 2) Igihembo, 3) Ububasha bw\'amategeko bw\'impande, 4) Intego yemewe n\'amategeko.',
        summary: 'Establishes requirements for valid commercial contracts',
        keywords: ['contract', 'offer', 'acceptance', 'consideration', 'validity'],
        applicableTo: [CaseType.Corporate, CaseType.Litigation],
      },
      {
        legalCodeId: commercialCode.id,
        articleNumber: '45',
        chapter: 'Chapter III',
        section: 'Breach of Contract',
        title: 'Remedies for Breach of Contract',
        textEN: 'When a party breaches a commercial contract, the other party may seek: 1) Specific performance, 2) Damages, 3) Contract termination, or 4) Injunctive relief.',
        textKY: 'Iyo umuntu acamo amasezerano y\'ubucuruzi, undi muntu ashobora gusaba: 1) Kurangiza inshingano, 2) Indishyi, 3) Gusesa amasezerano, cyangwa 4) Itegeko ryo guhagarika.',
        summary: 'Provides remedies available when a commercial contract is breached',
        keywords: ['breach of contract', 'damages', 'remedies', 'termination'],
        applicableTo: [CaseType.Corporate, CaseType.Litigation],
      },
    ],
    skipDuplicates: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 3. LABOR CODE
  // ═══════════════════════════════════════════════════════════════════════
  const laborCode = await prisma.legalCode.upsert({
    where: { code: 'LAW_N_66_2018_LABOR_CODE' },
    update: {},
    create: {
      code: 'LAW_N_66_2018_LABOR_CODE',
      officialTitle: 'Itegeko rigenga Umurimo',
      titleEN: 'Law Regulating Labour in Rwanda',
      titleFR: 'Loi régissant le travail au Rwanda',
      shortName: 'Labor Code 2018',
      type: LegalCodeType.Labor_Code,
      status: LegalStatus.Active,
      category: ['Employment', 'Workers Rights', 'Labor'],
      enactmentDate: new Date('2018-08-30'),
      effectiveDate: new Date('2019-02-01'),
      officialGazette: 'Official Gazette nº Special of 30/08/2018',
      lawNumber: 'N° 66/2018',
      summary: 'Regulates employment relationships, workers\' rights, working conditions, and labor disputes in Rwanda.',
    },
  });

  await prisma.legalArticle.createMany({
    data: [
      {
        legalCodeId: laborCode.id,
        articleNumber: '31',
        chapter: 'Chapter III',
        section: 'Employment Contracts',
        title: 'Written Employment Contract',
        textEN: 'An employment contract must be in writing and include: job description, salary, working hours, duration, and termination conditions.',
        textKY: 'Amasezerano y\'akazi agomba kuba yanditse kandi arimo: ibisobanuro by\'akazi, umushahara, amasaha y\'akazi, igihe, n\'ibijyanye no kurangiza.',
        summary: 'Requires employment contracts to be written with specific mandatory terms',
        keywords: ['employment contract', 'written contract', 'job terms'],
        applicableTo: [CaseType.Employment, CaseType.Litigation],
      },
      {
        legalCodeId: laborCode.id,
        articleNumber: '38',
        chapter: 'Chapter IV',
        section: 'Termination of Employment',
        title: 'Notice Period for Termination',
        textEN: 'An employer terminating a fixed-term or indefinite contract must provide notice: 1) 2 weeks for employees with less than 1 year service, 2) 1 month for employees with 1-5 years service, 3) 3 months for employees with more than 5 years service.',
        textKY: 'Umukoresha avuye ku masezerano agomba gutangaza: 1) Ibyumweru 2 ku bakozi bafite munsi y\'umwaka 1, 2) Ukwezi 1 ku bakozi bafite imyaka 1-5, 3) Amezi 3 ku bakozi bafite imyaka irenga 5.',
        summary: 'Establishes mandatory notice periods for employment termination based on length of service',
        keywords: ['termination', 'notice period', 'employment termination'],
        applicableTo: [CaseType.Employment, CaseType.Litigation],
      },
    ],
    skipDuplicates: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 4. LAND LAW
  // ═══════════════════════════════════════════════════════════════════════
  const landCode = await prisma.legalCode.upsert({
    where: { code: 'LAW_N_32_2015_LAND_CODE' },
    update: {},
    create: {
      code: 'LAW_N_32_2015_LAND_CODE',
      officialTitle: 'Itegeko rigenga Ubutaka',
      titleEN: 'Law Governing Land in Rwanda',
      titleFR: 'Loi régissant les terres au Rwanda',
      shortName: 'Land Code 2015',
      type: LegalCodeType.Land_Code,
      status: LegalStatus.Active,
      category: ['Property', 'Land', 'Real Estate'],
      enactmentDate: new Date('2015-06-11'),
      effectiveDate: new Date('2015-06-11'),
      officialGazette: 'Official Gazette nº Special of 11/06/2015',
      lawNumber: 'N° 32/2015',
      summary: 'Governs land ownership, use, transfer, and disputes in Rwanda.',
    },
  });

  await prisma.legalArticle.createMany({
    data: [
      {
        legalCodeId: landCode.id,
        articleNumber: '4',
        chapter: 'Chapter I',
        section: 'General Provisions',
        title: 'State Ownership of Land',
        textEN: 'All land in Rwanda belongs to the State. However, individuals and legal entities may hold land rights including emphyteutic lease, concession, and use rights.',
        textKY: 'Ubutaka bwose mu Rwanda ni ubwa Leta. Ariko, abantu n\'ibigo by\'amategeko bashobora kugira uburenganzira ku butaka harimo ubukode bw\'igihe kirekire, concession, n\'uburenganzira bwo kubukoresha.',
        summary: 'Establishes state ownership of land with private use rights',
        keywords: ['land ownership', 'state land', 'land rights'],
        applicableTo: [CaseType.Real_Estate, CaseType.Litigation],
      },
      {
        legalCodeId: landCode.id,
        articleNumber: '16',
        chapter: 'Chapter II',
        section: 'Land Registration',
        title: 'Requirement for Land Registration',
        textEN: 'All land transactions including sales, leases, mortgages, and transfers must be registered with the land registry to be legally valid.',
        textKY: 'Ibikorwa byose bijyanye n\'ubutaka harimo kugurisha, gukodesha, ingwate, no kwimura bigomba kwandikwa mu gitabo cy\'ubutaka kugira ngo bifite agaciro ku mategeko.',
        summary: 'Mandates registration of all land transactions for legal validity',
        keywords: ['land registration', 'property registration', 'land transactions'],
        applicableTo: [CaseType.Real_Estate, CaseType.Litigation],
      },
    ],
    skipDuplicates: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 5. INTELLECTUAL PROPERTY LAW
  // ═══════════════════════════════════════════════════════════════════════
  const ipLaw = await prisma.legalCode.upsert({
    where: { code: 'LAW_N_31_2009_IP' },
    update: {},
    create: {
      code: 'LAW_N_31_2009_IP',
      officialTitle: 'Itegeko rigenga Umutungo w\'Ubwenge',
      titleEN: 'Law on the Protection of Intellectual Property',
      titleFR: 'Loi relative à la protection de la propriété intellectuelle',
      shortName: 'IP Law 2009',
      type: LegalCodeType.Intellectual_Property,
      status: LegalStatus.Active,
      category: ['Intellectual Property', 'Patents', 'Trademarks', 'Copyright'],
      enactmentDate: new Date('2009-10-26'),
      effectiveDate: new Date('2009-10-26'),
      officialGazette: 'Official Gazette nº Special of 26/10/2009',
      lawNumber: 'N° 31/2009',
      summary: 'Protects intellectual property rights including patents, trademarks, copyrights, and industrial designs.',
    },
  });

  await prisma.legalArticle.createMany({
    data: [
      {
        legalCodeId: ipLaw.id,
        articleNumber: '3',
        chapter: 'Chapter I',
        section: 'Patents',
        title: 'Right to Patent',
        textEN: 'The inventor or their assignee has the right to obtain a patent for any invention that is new, involves an inventive step, and is industrially applicable.',
        textKY: 'Uwahimbye cyangwa uwamuhesheje uburenganzira afite uburenganzira bwo kubona patanti ku buhimbyi bushya, bufite intambwe y\'ubuhanga, kandi bushobora gukoreshwa mu nganda.',
        summary: 'Establishes requirements for obtaining patents (novelty, inventive step, industrial application)',
        keywords: ['patent', 'invention', 'novelty', 'industrial application'],
        applicableTo: [CaseType.IP],
      },
      {
        legalCodeId: ipLaw.id,
        articleNumber: '142',
        chapter: 'Chapter VI',
        section: 'Copyright',
        title: 'Protection of Copyright',
        textEN: 'Copyright protection extends to literary, artistic, and scientific works including books, music, films, software, and other creative works. Protection lasts for the author\'s lifetime plus 50 years.',
        textKY: 'Uburenganzira bw\'umuhimbyi bukingira ibikorwa by\'ubuvanganzo, ubuhanzi, n\'ubumenyi harimo ibitabo, umuziki, amafilime, software, n\'ibindi bikorwa by\'ubuhanga. Uburenganzira bukomeza mu gihe cy\'ubuzima bw\'uwabihimbye hamwe n\'imyaka 50.',
        summary: 'Protects creative works for author\'s lifetime plus 50 years',
        keywords: ['copyright', 'creative works', 'authorship', 'protection period'],
        applicableTo: [CaseType.IP],
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Rwandan Legal Database seeded successfully!');
  console.log(`   - ${await prisma.legalCode.count()} Legal Codes`);
  console.log(`   - ${await prisma.legalArticle.count()} Legal Articles`);
}

// Run if executed directly
if (require.main === module) {
  seedRwandanLaws()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
