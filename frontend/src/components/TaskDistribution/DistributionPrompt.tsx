import React, { useRef } from 'react';

interface DistributionProps {
    projectDescription: string;
    setProjectDescription: (val: string) => void;
    file: File | null;
    setFile: (val: File | null) => void;
    onDistribute: () => void;
    loading: boolean;
}

export default function ProjectInputForm({ projectDescription, setProjectDescription, file, setFile, onDistribute, loading }: DistributionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        if (input.files && input.files.length > 0) {
            setFile(input.files[0]);
        } else {
            setFile(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#B179DF] focus-within:ring-1 focus-within:ring-[#B179DF] transition-all">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project Context</span>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold font-sans flex items-center gap-1.5 text-gray-600 hover:text-[#B179DF] transition-colors bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        <span>📎</span> Attach Document
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                
                <textarea
                    className="w-full p-4 text-gray-700 outline-none resize-y min-h-[160px] text-sm leading-relaxed"
                    value={projectDescription}
                    placeholder="Describe your project here, or upload a specification document. Be as detailed as possible so Clovio can assign the right tasks to the right people based on their skills..."
                    onChange={(e) => setProjectDescription(e.target.value)}
                />
            </div>

            {/* Show selected file */}
            {file && (
                <div className="flex items-center justify-between p-3.5 bg-[#85D5C8]/10 border border-[#85D5C8]/30 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#85D5C8]/20 flex items-center justify-center text-[#2A9D8F]">
                            📄
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setFile(null)}
                        className="text-slate-400 hover:text-red-500 p-2"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={onDistribute}
                    disabled={loading || (!projectDescription.trim() && !file)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #B179DF, #85D5C8)" }}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <span>🚀</span> Distribute Tasks
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
