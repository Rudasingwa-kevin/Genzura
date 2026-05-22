import React from 'react';
import { FileText, User, Phone, Mail, CheckCircle2, Clock, Scale } from 'lucide-react';

interface CaseSummaryPDFProps {
  caseData: any;
}

const formatDate = (dateStr: string | null | undefined, fallback = 'None') => {
  if (!dateStr) return fallback;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return fallback;
  }
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

const getStatusColor = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'active': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    case 'pending': return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
    case 'closed': return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    case 'urgent': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
    default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
};

const getPriorityColor = (priority: string) => {
  switch ((priority || '').toLowerCase()) {
    case 'high': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
    case 'medium': return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
    case 'low': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
};

export const CaseSummaryPDF = React.forwardRef<HTMLDivElement, CaseSummaryPDFProps>(({ caseData }, ref) => {
  if (!caseData) return null;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusColors = getStatusColor(caseData.status);
  const priorityColors = getPriorityColor(caseData.priority);

  return (
    <div className="fixed top-[200vh] left-[200vw] pointer-events-none">
      {/*
        A4 PDF at 96 DPI: 794 x 1123px. We use 1200 x 1697 for crispness.
      */}
      <div
        ref={ref}
        id="pdf-summary-container"
        className="bg-white relative overflow-hidden"
        style={{ width: '1200px', minHeight: '1697px', padding: '72px 80px', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* Subtle diagonal watermark */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ opacity: 0.025 }}
        >
          <svg width="1200" height="1697" xmlns="http://www.w3.org/2000/svg">
            {[...Array(6)].map((_, i) => (
              <text
                key={i}
                x={-200 + i * 280}
                y={300 + i * 220}
                transform={`rotate(-35, ${-200 + i * 280}, ${300 + i * 220})`}
                fontSize="72"
                fontWeight="900"
                fill="#0f172a"
                letterSpacing="12"
              >
                GENZURA
              </text>
            ))}
          </svg>
        </div>

        {/* Top accent bar with elegant gradient */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: '8px', background: 'linear-gradient(90deg, #1e3a5f 0%, #3b82f6 50%, #22c55e 100%)' }}
        />

        {/* Subtle corner decorations */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle at bottom left, rgba(30, 58, 95, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* All content sits above watermark */}
        <div className="relative z-10 flex flex-col" style={{ minHeight: '1553px' }}>

          {/* ── HEADER ── */}
          <div
            className="flex justify-between items-center pb-8 mb-10"
            style={{ borderBottom: '3px solid #1e293b' }}
          >
            {/* Left: Title block */}
            <div>
              <h1
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                  margin: 0,
                  marginBottom: '8px',
                }}
              >
                CASE SUMMARY REPORT
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#1e3a5f',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '2px solid #bfdbfe',
                  }}
                >
                  {caseData.caseNumber || caseData.id}
                </span>
                {caseData.govCaseNumber && (
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#22c55e',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '2px solid #bbf7d0',
                    }}
                  >
                    GOV# {caseData.govCaseNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Logo + date */}
            <div style={{ textAlign: 'right' }}>
              <img
                src="/public/Genzura full logo.png"
                alt="Genzura"
                style={{ height: '80px', width: 'auto', display: 'inline-block', marginBottom: '6px' }}
              />
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  margin: 0,
                }}
              >
                Generated: {dateStr}
              </p>
            </div>
          </div>

          {/* ── STATUS BADGES ROW ── */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '36px',
              flexWrap: 'wrap',
            }}
          >
            {/* Status badge */}
            <span
              style={{
                padding: '6px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                background: statusColors.bg,
                color: statusColors.text,
                border: `1px solid ${statusColors.border}`,
              }}
            >
              {caseData.status}
            </span>
            {/* Priority badge */}
            <span
              style={{
                padding: '6px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                background: priorityColors.bg,
                color: priorityColors.text,
                border: `1px solid ${priorityColors.border}`,
              }}
            >
              {caseData.priority} Priority
            </span>
            {/* Type badge */}
            <span
              style={{
                padding: '6px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}
            >
              {caseData.type}
            </span>
            {/* Deadline badge */}
            {caseData.deadline && (
              <span
                style={{
                  padding: '6px 18px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  background: '#fdf4ff',
                  color: '#7e22ce',
                  border: '1px solid #e9d5ff',
                }}
              >
                Due: {formatDate(caseData.deadline)}
              </span>
            )}
          </div>

          {/* ── OVERVIEW GRID ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Case Overview card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                padding: '36px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
              }}
            >
              <h3
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileText size={14} /> Case Overview
              </h3>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3,
                  marginBottom: '24px',
                }}
              >
                {caseData.title}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Status</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{caseData.status}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Priority</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{caseData.priority}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Type</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{caseData.type}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Deadline</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{formatDate(caseData.deadline)}</p>
                </div>
                {caseData.govCaseNumber && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Government Case No.</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', fontFamily: 'monospace' }}>{caseData.govCaseNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Client Information card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                padding: '36px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
              }}
            >
              <h3
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <User size={14} /> Client Information
              </h3>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '4px' }}>
                {caseData.clientObject?.name || caseData.client || 'Unknown Client'}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', marginBottom: '24px' }}>
                {caseData.clientObject?.company || caseData.clientCompany || 'Private Individual'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>
                    {caseData.clientObject?.email || caseData.clientEmail || 'No email on record'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <Phone size={16} />
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>
                    {caseData.clientObject?.phone || caseData.clientPhone || 'No phone on record'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CASE DETAILS ── */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                marginBottom: '16px',
              }}
            >
              Case Details
            </h3>
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                padding: '36px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
              }}
            >
              <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8, fontWeight: 500 }}>
                {caseData.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* ── LEGAL TEAM ── */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                marginBottom: '16px',
              }}
            >
              Legal Team
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Lead Counsel */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '24px 28px',
                  borderRadius: '18px',
                  border: '2px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '20px',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.3)',
                  }}
                >
                  {caseData.attorneyObject?.initials ||
                    (caseData.attorneyObject?.name || caseData.attorney || '')?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                    '??'}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '19px', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                    {caseData.attorneyObject?.name || caseData.attorney || 'Unassigned'}
                  </p>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '6px' }}>
                    ⭐ Lead Counsel
                  </p>
                </div>
              </div>

              {/* Team members */}
              {caseData.team?.map((member: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '24px 28px',
                    borderRadius: '18px',
                    border: '2px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      color: '#475569',
                      border: '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {member.user?.initials ||
                      member.user?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase() ||
                      member.initials ||
                      member.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase() ||
                      '??'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                      {member.user?.name || member.name}
                    </p>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '6px' }}>
                      {member.role || 'Team Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECENT ACTIVITY ── */}
          {caseData.timeline && caseData.timeline.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Clock size={14} /> Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {caseData.timeline.slice(0, 4).map((evt: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px 24px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={18} color="#22c55e" />
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {evt.description}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>
                        By {evt.author?.name || evt.author || 'System'} • {formatDateTime(evt.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SPACER ── */}
          <div style={{ flex: 1 }} />

          {/* ── FOOTER ── */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '3px solid #e2e8f0',
              textAlign: 'center',
              background: 'linear-gradient(to bottom, transparent 0%, #f8fafc 100%)',
              borderRadius: '20px 20px 0 0',
              padding: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <Scale size={16} color="#94a3b8" />
              <p
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  margin: 0,
                }}
              >
                Confidential &amp; Privileged Attorney Work Product
              </p>
              <Scale size={16} color="#94a3b8" />
            </div>
            <p
              style={{
                fontSize: '9px',
                fontWeight: 500,
                color: '#94a3b8',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              This document contains confidential information intended only for the use of the individual or entity
              named above. If the reader of this document is not the intended recipient, you are hereby notified
              that any dissemination, distribution, or copying of this communication is strictly prohibited.
            </p>
            <p
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginTop: '16px',
              }}
            >
              © {new Date().getFullYear()} Genzura Legal Platform — Stay in Control of Every Case.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
});

CaseSummaryPDF.displayName = 'CaseSummaryPDF';
