import React, { useState } from 'react';
import {
  Upload,
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import BsaUploadModal from '../components/bsa/BsaUploadModal';
import BsaReportView from '../components/bsa/BsaReportView';

export default function BankStatementAnalysis() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  const handleUploadSuccess = (report, jobId) => {
    setReportData(report);
    setCurrentJobId(jobId);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bank Statement Analyzer
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              End-to-End Mathematical Reconciliation, Forensic Underwriting & Risk Scorecard
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload New Statement
          </button>
        </div>

        {/* Upload Modal */}
        <BsaUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Report View or Empty State */}
        {reportData ? (
          <BsaReportView reportData={reportData} jobId={currentJobId} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Active Statement Report</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Upload customer bank statements (PDF, Scanned Documents, XLSX, CSV) to generate instant credit intelligence reports, running balance reconciliations, and risk scores.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Statement Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

