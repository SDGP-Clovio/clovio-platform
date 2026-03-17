import React from 'react';

interface DistributionProps {
    projectDescription: string;
    setProjectDescription: (val: string) => void;
    file: File | null;
    setFile: (val: File | null) => void;
    onDistribute: () => void;
    loading: boolean;
}

export default function ProjectInputForm({ projectDescription, setProjectDescription, file, setFile, onDistribute, loading }: DistributionProps) {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        if (input.files && input.files.length > 0) {
            setFile(input.files[0]);
        } else {
            setFile(null);
        }
    };
    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white">

            {/* Heading */}
            <h2 className="text-xl font-semibold">AI Task Distribution</h2>

            {/* Prompt */}
            <p className="text-sm text-gray-600">
                Enter a project description or upload a specification document.
                Clovio will take care of the task distribution.
            </p>

            {/* Description input */}
            <textarea
                className="border rounded p-2 w-full"
                rows={4}
                value={projectDescription}
                placeholder="Enter project description..."
                onChange={(e) => setProjectDescription(e.target.value)}
            />

            {/* File upload */}
            <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="border rounded p-2"
            />

            {/* Show selected file */}
            {file && (
                <p className="text-sm text-gray-700">
                    Selected file: {file.name}
                </p>
            )}

            {/* Submit */}
            <button
                onClick={onDistribute}
                disabled={loading || (!projectDescription.trim() && !file)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? "Generating..." : "Distribute Tasks"}
            </button>

        </div>
    );
}

