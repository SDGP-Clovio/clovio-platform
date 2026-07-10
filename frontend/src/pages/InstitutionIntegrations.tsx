import { useState } from "react";
import { Menu, X, CheckCircle2, Server, Globe, BookOpen } from "lucide-react";
import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";

export default function InstitutionIntegrations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [moodleStatus, setMoodleStatus] = useState<'idle' | 'testing' | 'success'>('idle');

    const handleTestMoodle = () => {
        setMoodleStatus('testing');
        setTimeout(() => {
            setMoodleStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-clovio-bg">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <SupervisorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="lg:ml-64 min-h-screen bg-slate-50/30 flex flex-col">
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Settings</p>
                    <h1 className="text-2xl font-extrabold text-slate-800">Institution Integrations</h1>
                </header>

                <div className="flex-1 p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
                    <div className="bg-white border border-indigo-100 bg-indigo-50/50 p-6 rounded-2xl">
                        <h2 className="text-lg font-bold text-indigo-900 mb-2">Seamless Grade Syncing</h2>
                        <p className="text-sm text-indigo-700/80">
                            Connect Clovio directly to your institution's Learning Management System. 
                            Export contribution scores, fairness flags, and final grades with zero manual data entry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Moodle Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Early Access</span>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Moodle LTI 1.3</h3>
                            <p className="text-sm text-slate-500 flex-1 mb-6">
                                Sync assignments and post grades securely using the newest LTI standard.
                            </p>

                            {moodleStatus === 'success' ? (
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-medium text-emerald-700 leading-snug">
                                        Connected to sandbox environment. Grade sync is ready.
                                    </p>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleTestMoodle}
                                    disabled={moodleStatus === 'testing'}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {moodleStatus === 'testing' ? (
                                        <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Testing Connection...</>
                                    ) : (
                                        'Test Connection'
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Canvas Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full relative opacity-70 grayscale">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Coming Q4</span>
                            </div>
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4">
                                <Server className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Canvas LMS</h3>
                            <p className="text-sm text-slate-500 flex-1 mb-6">
                                Direct integration with Instructure Canvas via API and LTI.
                            </p>
                            <button disabled className="w-full bg-slate-100 text-slate-400 font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                                Not Configured
                            </button>
                        </div>

                        {/* Blackboard Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full relative opacity-70 grayscale">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Coming Q4</span>
                            </div>
                            <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Blackboard Learn</h3>
                            <p className="text-sm text-slate-500 flex-1 mb-6">
                                Ultra and Original experience compatibility for automated syncing.
                            </p>
                            <button disabled className="w-full bg-slate-100 text-slate-400 font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                                Not Configured
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
