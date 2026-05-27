import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding plan configurations...');

  const plans = [
    {
      plan: SubscriptionPlan.Genzura,
      price: 0,
      duration: 0,
      displayName: 'Genzura',
      tagline: 'Free Forever',
      description: 'Perfect for getting started with case management',
      maxCases: 20,
      maxDocuments: 20,
      maxTeamMembers: 1,
      storageGB: 0.5,
      features: {
        documentDownload: false,
        calendarIntegration: 'Basic',
        notifications: 'Email only',
        analytics: false,
        prioritySupport: false,
        exportReports: false,
        apiAccess: false,
        customBranding: false
      },
      isActive: true,
      isVisible: true,
      lastModifiedBy: 'system'
    },
    {
      plan: SubscriptionPlan.Intango,
      price: 100000,
      duration: 90,
      displayName: 'Intango Professional',
      tagline: 'Most Popular',
      description: 'Full-featured professional tier with unlimited cases - quarterly billing',
      maxCases: null,
      maxDocuments: null,
      maxTeamMembers: null,
      storageGB: 100,
      features: {
        documentDownload: true,
        calendarIntegration: 'Advanced',
        notifications: 'Email + SMS + In-App',
        analytics: true,
        prioritySupport: true,
        exportReports: true,
        apiAccess: true,
        customBranding: true
      },
      isActive: true,
      isVisible: true,
      lastModifiedBy: 'system'
    },
    {
      plan: SubscriptionPlan.Inkingi,
      price: 250000,
      duration: 365,
      displayName: 'Inkingi Enterprise',
      tagline: 'Best Value - Save 37%',
      description: 'Same premium features as Intango with significant annual savings',
      maxCases: null,
      maxDocuments: null,
      maxTeamMembers: null,
      storageGB: 500,
      features: {
        documentDownload: true,
        calendarIntegration: 'Advanced',
        notifications: 'Email + SMS + In-App',
        analytics: true,
        prioritySupport: true,
        exportReports: true,
        apiAccess: true,
        customBranding: true
      },
      isActive: true,
      isVisible: true,
      lastModifiedBy: 'system'
    }
  ];

  for (const planData of plans) {
    const plan = await prisma.planConfig.upsert({
      where: { plan: planData.plan },
      update: planData,
      create: planData
    });
    console.log(`✅ Created/Updated plan: ${plan.displayName} (${plan.plan})`);
  }

  console.log('✨ Plan seeding complete!');
}

seedPlans()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
