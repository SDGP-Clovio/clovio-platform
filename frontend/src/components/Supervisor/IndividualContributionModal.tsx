
import Modal from '../UI/Modal';
import { Download, FileText, CheckCircle, Activity, Award } from 'lucide-react';
import type { SupervisorContributionItem } from '../../types/supervisor';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    member: SupervisorContributionItem | null;
}

export default function IndividualContributionModal({ isOpen, onClose, member }: Props) {
    if (!member) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Individual Contribution Report" size="xl">
            <div className="p-6 bg-slate-50 print:bg-white print:p-0">
                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-slate-800">Clovio Accreditation Report</h1>
                    <p className="text-slate-500">Student Individual Contribution Evidence</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{member.name}</h2>
                            <p className="text-sm text-slate-500">Student ID: CL-{member.user_id}</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="print:hidden inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export Grading Report
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Contribution Score</p>
                                <p className="text-lg font-bold text-indigo-700">{member.contribution_percent.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Tasks Completed</p>
                                <p className="text-lg font-bold text-emerald-700">{member.tasks_completed}</p>
                            </div>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Activity Score</p>
                                <p className="text-lg font-bold text-blue-700">{member.activity_score.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Task Breakdown Summary
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Metric</th>
                                        <th className="px-4 py-3 font-semibold text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-4 py-3 font-medium text-slate-700">Total System Updates</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{member.updates_count}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium text-slate-700">Task Completion Volume</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{member.tasks_completed} tasks</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium text-slate-700">Relative Complexity Handled</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{member.activity_score.toFixed(2)} pts</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium text-slate-700">Overall Contribution Tier</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                member.contribution_percent >= 25 ? 'bg-emerald-100 text-emerald-700' :
                                                member.contribution_percent >= 10 ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {member.contribution_percent >= 25 ? 'High Impact' : member.contribution_percent >= 10 ? 'Expected' : 'Below Average'}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-center text-xs text-slate-400 border-t pt-4">
                    Generated by Clovio Platform on {new Date().toLocaleDateString()}
                    <br />
                    Accreditation-ready evidence for group work grading.
                </div>
            </div>
            
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .modal-content, .modal-content * {
                        visibility: visible;
                    }
                    .modal-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none !important;
                        background: transparent !important;
                    }
                    /* Hide modal close buttons and overlays */
                    .fixed.inset-0.bg-black\\/30 { display: none !important; }
                    button[aria-label="Close"] { display: none !important; }
                }
                `}
            </style>
        </Modal>
    );
}
