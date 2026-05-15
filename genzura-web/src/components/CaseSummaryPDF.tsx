import React from 'react';
import { FileText, User, Phone, Mail, CheckCircle2, Clock } from 'lucide-react';

interface CaseSummaryPDFProps {
  caseData: any;
}

export const CaseSummaryPDF = React.forwardRef<HTMLDivElement, CaseSummaryPDFProps>(({ caseData }, ref) => {
  if (!caseData) return null;

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed top-[200vh] left-[200vw] pointer-events-none">
      {/* 
        This is the container we will snapshot.
        Using fixed pixel dimensions standard for A4 PDF (at 96 DPI: 794 x 1123).
        We'll use a slightly larger canvas for crispness (1200 x 1697)
      */}
      <div 
        ref={ref} 
        id="pdf-summary-container"
        className="bg-white relative overflow-hidden" 
        style={{ width: '1200px', minHeight: '1697px', padding: '80px' }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <svg viewBox="0 0 100 100" className="w-[800px] h-[800px] -rotate-45">
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="#1e293b" letterSpacing="0.1em">
              GENZURA
            </text>
          </svg>
        </div>

        {/* Content (z-10 to stay above watermark) */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="border-b-4 border-slate-800 pb-8 mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-2">CASE SUMMARY REPORT</h1>
              <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">{caseData.id}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-800 tracking-tighter flex items-center justify-end gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-slate-800 inline-block" /> GENZURA
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generated: {dateStr}</p>
            </div>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-10 mb-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={16} /> Case Overview
              </h3>
              <p className="text-3xl font-bold text-slate-800 leading-tight mb-4">{caseData.title}</p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-lg font-bold text-slate-800">{caseData.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                  <p className="text-lg font-bold text-slate-800">{caseData.priority}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="text-lg font-bold text-slate-800">{caseData.type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-lg font-bold text-slate-800">{caseData.deadline || 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={16} /> Client Information
              </h3>
              <p className="text-3xl font-bold text-slate-800 leading-tight mb-1">{caseData.client}</p>
              <p className="text-lg font-bold text-slate-500 mb-6">{caseData.clientCompany}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-600">
                  <Mail size={18} />
                  <span className="text-lg font-semibold">{caseData.clientEmail}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <Phone size={18} />
                  <span className="text-lg font-semibold">{caseData.clientPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Case Details</h3>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {caseData.description}
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="mb-12">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Legal Team</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="w-14 h-14 bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  {caseData.attorney.split(' ').map((w: string) => w[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-xl text-slate-800">{caseData.attorney}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Counsel</p>
                </div>
              </div>
              {caseData.team?.map((member: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="w-14 h-14 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xl">
                    {member.initials || member.name.split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-xl text-slate-800">{member.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{member.role || 'Team Member'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {caseData.timeline && caseData.timeline.length > 0 && (
            <div className="mb-auto">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={16} /> Recent Activity
              </h3>
              <div className="space-y-4">
                {caseData.timeline.slice(0, 4).map((evt: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800">{evt.description}</p>
                      <p className="text-sm font-semibold text-slate-500 mt-1">
                        By {evt.author} • {new Date(evt.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              CONFIDENTIAL & PRIVILEGED ATTORNEY WORK PRODUCT
            </p>
            <p className="text-[9px] font-semibold text-slate-400 mt-2 max-w-2xl mx-auto">
              This document contains confidential information intended only for the use of the individual or entity named above. 
              If the reader of this document is not the intended recipient, you are hereby notified that any dissemination, 
              distribution, or copying of this communication is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

CaseSummaryPDF.displayName = 'CaseSummaryPDF';
