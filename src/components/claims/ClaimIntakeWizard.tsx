import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { ClaimService } from '../../services/claimService';
import { ContinuityIntelligence } from '../../services/continuityIntelligence';
import { CoveredEventType } from '../../types/insurance';
import { COVERED_EVENT_DETAILS, formatINR } from '../../config/constants';
import {
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck,
  Building2,
  Info
} from 'lucide-react';

export const ClaimIntakeWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { policies, addClaim } = useInsurance();

  const userPolicies = policies.filter(p => p.guardianId === currentUser.id);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(userPolicies[0]?.id || policies[0]?.id || '');

  const [eventType, setEventType] = useState<CoveredEventType>('sponsor_critical_illness');
  const [eventDate, setEventDate] = useState<string>('2026-01-10');
  const [description, setDescription] = useState<string>('Primary sponsor hospitalized for acute treatment requiring immediate tuition fee continuity assistance.');
  const [requestedAmount, setRequestedAmount] = useState<number>(140000);

  // Uploaded files with simulated OCR
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    detectedType: any;
    summary: string;
    flags: string[];
  }>>([
    {
      name: 'Specialist_Diagnostic_Report.pdf',
      size: 1250000,
      detectedType: 'medical_report',
      summary: 'Inpatient Diagnostic Summary authenticated with clinical ICD-10 registry coding.',
      flags: ['Attending physician signature confirmed', 'Matches primary sponsor identity: Rajesh Sharma'],
    },
    {
      name: 'University_Semester_Fee_Invoice.pdf',
      size: 820000,
      detectedType: 'university_fee_invoice',
      summary: 'Official College Bursar Fee Demand Voucher.',
      flags: ['Demanded fee: ₹1,40,000 matches requested claim', 'Student enrollment authenticated'],
    }
  ]);

  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const activePolicy = policies.find(p => p.id === selectedPolicyId) || policies[0];
  const eventConfig = COVERED_EVENT_DETAILS[eventType];

  const handleSimulateAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSimulatingUpload(true);
    setTimeout(() => {
      const analysis = ContinuityIntelligence.analyzeDocument(file, {
        guardianName: activePolicy?.guardianName,
        studentName: activePolicy?.studentName,
        requestedAmount,
      });

      setUploadedFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          detectedType: analysis.detectedType,
          summary: analysis.summary,
          flags: analysis.flags,
        }
      ]);
      setIsSimulatingUpload(false);
    }, 600);
  };

  const handleSubmitClaim = () => {
    if (!activePolicy) return;

    const claim = ClaimService.createClaim({
      policy: activePolicy,
      eventType,
      eventDate,
      claimDescription: description,
      requestedAmount,
      claimantName: currentUser.displayName,
      claimantRole: currentUser.role,
      uploadedDocuments: uploadedFiles.map(f => ({
        documentType: f.detectedType,
        fileName: f.name,
        fileSize: f.size,
        fileUrl: `/docs/${f.name}`,
        uploadedBy: currentUser.displayName,
        ocrDetectedData: {
          documentClassification: f.detectedType,
          confidenceScore: 0.95,
          flags: f.flags,
        }
      })),
    });

    addClaim(claim);
    navigate('/claims');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full mb-2 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Guidewire ClaimCenter &bull; First Notice of Loss (FNOL)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          File Education Continuity Claim
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Initiate tuition fee continuity claim for covered sponsor disruptions with instant AI document validation.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 1: Policy Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <FileCheck className="w-4 h-4 mr-2 text-brand-600" />
            1. Select Enrolled Education Policy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {policies.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPolicyId(p.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  p.id === selectedPolicyId
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-slate-800">{p.policyNumber}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold uppercase">
                    {p.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mt-1">{p.planName}</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Student: {p.studentName} ({p.universityName})</p>
                <p className="text-brand-700 font-bold mt-2">Remaining Coverage: {formatINR(p.remainingCoverage)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Covered Event & Circumstances */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
            2. Covered Disruption Event & Circumstances
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Covered Event Category</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CoveredEventType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-brand-500"
              >
                {Object.keys(COVERED_EVENT_DETAILS).map(k => (
                  <option key={k} value={k}>
                    {COVERED_EVENT_DETAILS[k as CoveredEventType].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Incident / Diagnosis</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Requested Tuition Fee Continuity Amount (INR)
              </label>
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Will be verified directly with {activePolicy?.universityName || 'University'} Registrar
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Detailed Event Circumstances</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Supporting Documents with AI Assistant */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Upload className="w-4 h-4 mr-2 text-teal-600" />
              3. Upload Supporting Documents (Private & Secure)
            </h2>
            <span className="text-[11px] text-slate-400">PDF, JPG, PNG &bull; Max 10MB</span>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Attach Event Proof or College Fee Demands</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Files are processed by the EduShield OCR & Document Verification Assistant</p>
            <label className="mt-3 inline-flex items-center text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition">
              <span>Choose Document File</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.png"
                onChange={handleSimulateAddFile}
              />
            </label>
            {isSimulatingUpload && (
              <p className="text-xs text-brand-600 mt-2 font-medium animate-pulse">
                Running OCR inspection & policy cross-matching...
              </p>
            )}
          </div>

          {/* AI Inspected Documents */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Attached Verified Documents ({uploadedFiles.length}):
            </span>
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex items-start justify-between space-x-3 shadow-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900">{doc.name}</span>
                    <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold border border-teal-200 uppercase">
                      {doc.detectedType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{doc.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {doc.flags.map((flag, fIdx) => (
                      <span key={fIdx} className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{(doc.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Direct Settlement Notice */}
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-start space-x-3">
          <Building2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Direct University Payout Protocol:</strong> Upon approval, funds will be disbursed via NEFT directly to the authenticated tuition fee escrow account of {activePolicy?.universityName}. No cash is disbursed to individuals, ensuring total academic continuity.
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate('/claims')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitClaim}
            className="inline-flex items-center px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-lg transition shadow-md shadow-brand-500/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit Claim to Adjudication Desk
          </button>
        </div>
      </div>
    </div>
  );
};
