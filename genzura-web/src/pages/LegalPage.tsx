import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'May 1, 2026',
    content: (
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>At Genzura, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our SaaS platform.</p>
        
        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">1. Information We Collect</h3>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
          <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services.</li>
        </ul>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">2. Use of Your Information</h3>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create and manage your account.</li>
          <li>Process your transactions and send you related information.</li>
          <li>Improve our website and services to better serve you.</li>
          <li>Respond to your customer service requests and support needs.</li>
        </ul>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">3. Disclosure of Your Information</h3>
        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf.</li>
        </ul>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    lastUpdated: 'April 15, 2026',
    content: (
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Genzura (“we,” “us” or “our”), concerning your access to and use of our platform.</p>
        
        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">1. Agreement to Terms</h3>
        <p>By accessing the platform, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the platform and you must discontinue use immediately.</p>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">2. User Representations</h3>
        <p>By using the platform, you represent and warrant that:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You will not use the platform for any illegal or unauthorized purpose.</li>
        </ul>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">3. Prohibited Activities</h3>
        <p>You may not access or use the platform for any purpose other than that for which we make the platform available. The platform may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">4. Intellectual Property Rights</h3>
        <p>Unless otherwise indicated, the platform is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the platform (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.</p>
      </div>
    )
  },
  security: {
    title: 'Security',
    icon: Lock,
    lastUpdated: 'May 3, 2026',
    content: (
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>Security is a core pillar of the Genzura platform. We employ enterprise-grade security measures to ensure your data and your clients' data remains strictly confidential and protected against unauthorized access.</p>
        
        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">1. Data Encryption</h3>
        <p>All data transmitted between your browser and our servers is encrypted in transit using industry-standard TLS 1.3. Data at rest is encrypted using AES-256 encryption. Our database volumes are fully encrypted, ensuring that your data remains secure even in the event of physical compromise.</p>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">2. Infrastructure Security</h3>
        <p>Genzura is hosted on secure, SOC 2 compliant infrastructure. We employ rigorous network isolation, firewalls, and continuous monitoring to detect and prevent unauthorized access or anomalous activities. Our systems undergo regular vulnerability scanning and penetration testing.</p>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">3. Access Controls</h3>
        <p>We implement strict role-based access control (RBAC) both internally and within the platform. Internally, only authorized personnel have access to production systems, governed by the principle of least privilege. Within the platform, you have granular control over what your team members can see and do.</p>

        <h3 className="text-lg font-bold text-brand-dark mt-8 mb-4">4. Compliance</h3>
        <p>Genzura is designed to help law firms meet their compliance obligations, including GDPR, CCPA, and industry-specific regulations regarding client confidentiality and data retention.</p>
      </div>
    )
  }
};

export default function LegalPage() {
  const { documentId } = useParams<{ documentId: string }>();
  
  // Default to privacy if route param is invalid
  const docKey = (documentId && documentId in LEGAL_CONTENT) 
    ? documentId as keyof typeof LEGAL_CONTENT 
    : 'privacy';
    
  const data = LEGAL_CONTENT[docKey];
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-page-bg font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border-base sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Genzura website header.png" alt="Genzura" className="h-10 w-auto" />
          </Link>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm font-bold text-text-secondary hover:text-brand-blue transition-colors">Log In</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-white rounded-[2rem] border border-border-base p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue shrink-0">
              <Icon size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">{data.title}</h1>
              <p className="text-sm text-text-muted mt-1">Last updated: {data.lastUpdated}</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-border-base my-8" />
          
          <article>
            {data.content}
          </article>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-border-base py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Genzura. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
