import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ProgressIndicator from '../UI/ProgressIndicator';
import { useApp } from '../../context/AppContext';
import MemberSearch from './MemberSearch';

interface ProjectFormData {
    name: string;
    description: string;
    deadline: string;
    courseName: string;
    teamMembers: string[];
}

const ProjectWizard: React.FC = () => {
    const navigate = useNavigate();
    const { users, createProject } = useApp();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        deadline: '',
        courseName: '',
        teamMembers: [],
    });

    const steps = [
        { label: 'Details', description: 'Project info' },
        { label: 'Team',    description: 'Add members' },
        { label: 'Review',  description: 'Confirm & create' },
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    const handleCreate = () => {
        const newProject = createProject({
            name: formData.name,
            description: formData.description,
            deadline: formData.deadline,
            courseName: formData.courseName,
            teamMembers: formData.teamMembers,
            tasks: [],
        });
        navigate(`/project/${newProject.id}`);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.name.trim() !== '' && formData.description.trim() !== '';
            case 2: return formData.teamMembers.length > 0;
            case 3: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                    >
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium">Cancel</span>
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Create New Project</h1>
                    <p className="text-slate-500 mt-1">Set up your group project in a few steps</p>
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />

                {/* Wizard Content */}
                <div className="bg-white rounded-xl border border-slate-100 p-8 mb-6">
                    {currentStep === 1 && (
                        <Step1ProjectDetails formData={formData} setFormData={setFormData} />
                    )}
                    {currentStep === 2 && (
                        <Step2TeamSelection formData={formData} setFormData={setFormData} users={users} />
                    )}
                    {currentStep === 3 && (
                        <Step3Review formData={formData} users={users} />
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${currentStep === 1
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {currentStep < steps.length ? (
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${isStepValid()
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:brightness-110 shadow-md'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:brightness-110 shadow-md transition-all"
                        >
                            <Check className="w-4 h-4" />
                            Create Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Step 1: Project Details
const Step1ProjectDetails: React.FC<{
    formData: ProjectFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
}> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Project Details</h2>
                <p className="text-sm text-slate-500">Tell us about your project</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile App Development"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project goals and objectives..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Name</label>
                    <input
                        type="text"
                        value={formData.courseName}
                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                        placeholder="e.g., Software Engineering"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                    <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

// Step 2: Team Selection — email search
const Step2TeamSelection: React.FC<{
    formData: ProjectFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
    users: any[];
}> = ({ formData, setFormData, users }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Select Team Members</h2>
            <p className="text-sm text-slate-500">Search by name or email to add members</p>
        </div>
        <MemberSearch
            allUsers={users}
            selectedIds={formData.teamMembers}
            onChange={(ids) => setFormData({ ...formData, teamMembers: ids })}
        />
    </div>
);

// Step 3: Review
const Step3Review: React.FC<{
    formData: ProjectFormData;
    users: any[];
}> = ({ formData, users }) => {
    const selectedUsers = users.filter(u => formData.teamMembers.includes(u.id));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Review & Create</h2>
                <p className="text-sm text-slate-500">Make sure everything looks good before creating</p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Project Details</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div>
                            <span className="text-xs text-slate-500">Name:</span>
                            <p className="font-medium text-slate-800">{formData.name}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500">Description:</span>
                            <p className="text-sm text-slate-700">{formData.description}</p>
                        </div>
                        {formData.courseName && (
                            <div>
                                <span className="text-xs text-slate-500">Course:</span>
                                <p className="text-sm text-slate-700">{formData.courseName}</p>
                            </div>
                        )}
                        {formData.deadline && (
                            <div>
                                <span className="text-xs text-slate-500">Deadline:</span>
                                <p className="text-sm text-slate-700">
                                    {new Date(formData.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Team Members ({selectedUsers.length})</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm text-slate-700">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectWizard;
