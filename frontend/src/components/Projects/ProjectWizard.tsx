import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ProgressIndicator from '../UI/ProgressIndicator';
import { useApp } from '../../context/AppContext';
import MemberSearch from './MemberSearch';
import type { User } from '../../types/types';
import { fetchCurrentUserAsAppUser, fetchUsers } from '../../services/users';
import { createProjectRecord, type CreateProjectApiRequest } from '../../services/projects';

interface ProjectFormData {
    name: string;
    description: string;
    deadline: string;
    courseName: string;
    teamMembers: number[];
    supervisorId: number | null;
}

const resolveErrorMessage = (error: unknown, fallback: string): string => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
    ) {
        const response = (error as { response?: { data?: { detail?: unknown } } }).response;
        const detail = response?.data?.detail;
        if (typeof detail === 'string' && detail.length > 0) {
            return detail;
        }
        if (Array.isArray(detail)) {
            const combined = detail
                .map((entry: { msg?: string }) => entry?.msg)
                .filter((value): value is string => typeof value === 'string' && value.length > 0)
                .join(', ');
            if (combined.length > 0) {
                return combined;
            }
        }
    }

    if (error instanceof Error && error.message.length > 0) {
        return error.message;
    }

    return fallback;
};

const ProjectWizard: React.FC = () => {
    const navigate = useNavigate();
    const { createProject } = useApp();
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [createError, setCreateError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        deadline: '',
        courseName: '',
        teamMembers: [],
        supervisorId: null,
    });

    const supervisors = availableUsers.filter((user) => user.role === 'supervisor');

    useEffect(() => {
        let isMounted = true;

        const loadUsers = async () => {
            setLoadingUsers(true);
            setUsersError('');

            try {
                const records = await fetchUsers();
                if (!isMounted) {
                    return;
                }
                setAvailableUsers(records);
            } catch (error) {
                if (isMounted) {
                    setUsersError(resolveErrorMessage(error, 'Unable to load users from the database.'));
                    setAvailableUsers([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingUsers(false);
                }
            }
        };

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (formData.supervisorId == null && supervisors.length > 0) {
            setFormData((prev) => ({ ...prev, supervisorId: supervisors[0].id }));
        }
    }, [formData.supervisorId, supervisors]);

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

    const handleCreate = async () => {
        setCreateError('');

        if (!isStepValid()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const currentUser = await fetchCurrentUserAsAppUser();

            const payload: CreateProjectApiRequest = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: 'planned',
                created_by: currentUser.id,
                member_ids: Array.from(new Set(formData.teamMembers)),
                supervisor_id: formData.supervisorId ?? undefined,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
            };

            const savedProject = await createProjectRecord(payload);

            const localProject = createProject({
                projectId: savedProject.id,
                name: formData.name,
                description: formData.description,
                deadline: formData.deadline,
                courseName: formData.courseName,
                teamMembers: formData.teamMembers,
                supervisorId: formData.supervisorId,
                tasks: [],
            });

            navigate(`/project/${localProject.id}`);
        } catch (error) {
            setCreateError(resolveErrorMessage(error, 'Project creation failed. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.name.trim() !== '' && formData.description.trim() !== '';
            case 2:
                if (loadingUsers || availableUsers.length === 0) {
                    return false;
                }
                return formData.teamMembers.length > 0 && formData.supervisorId != null;
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
                        <Step2TeamSelection
                            formData={formData}
                            setFormData={setFormData}
                            users={availableUsers}
                            supervisors={supervisors}
                            loadingUsers={loadingUsers}
                            usersError={usersError}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Review formData={formData} users={availableUsers} />
                    )}
                </div>

                {createError && (
                    <p className="mb-4 text-sm text-red-600">{createError}</p>
                )}

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
                            disabled={!isStepValid() || isSubmitting}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                                !isStepValid() || isSubmitting
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:brightness-110 shadow-md'
                            }`}
                        >
                            <Check className="w-4 h-4" />
                            {isSubmitting ? 'Creating...' : 'Create Project'}
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
                        title="Project deadline"
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
    users: User[];
    supervisors: User[];
    loadingUsers: boolean;
    usersError: string;
}> = ({ formData, setFormData, users, supervisors, loadingUsers, usersError }) => {
    const [supervisorQuery, setSupervisorQuery] = useState('');
    const [showSupervisorResults, setShowSupervisorResults] = useState(false);

    const selectedSupervisor = supervisors.find((supervisor) => supervisor.id === formData.supervisorId) ?? null;

    const filteredSupervisors = supervisors.filter((supervisor) => {
        const query = supervisorQuery.trim().toLowerCase();
        if (!query) {
            return true;
        }

        return (
            supervisor.name.toLowerCase().includes(query) ||
            supervisor.email.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Select Team Members</h2>
                <p className="text-sm text-slate-500">Search users from your database and assign a supervisor</p>
            </div>

            {loadingUsers && <p className="text-sm text-slate-500">Loading users from database...</p>}
            {usersError && <p className="text-sm text-red-600">{usersError}</p>}

            {!loadingUsers && !usersError && (
                <>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Supervisor <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                title="Search supervisor"
                                value={supervisorQuery}
                                onChange={(e) => {
                                    setSupervisorQuery(e.target.value);
                                    setShowSupervisorResults(true);
                                }}
                                onFocus={() => setShowSupervisorResults(true)}
                                onBlur={() => window.setTimeout(() => setShowSupervisorResults(false), 120)}
                                placeholder="Search supervisor by name or email..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                            />

                            {showSupervisorResults && (
                                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                                    {filteredSupervisors.length > 0 ? (
                                        filteredSupervisors.slice(0, 8).map((supervisor) => (
                                            <button
                                                key={supervisor.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, supervisorId: supervisor.id });
                                                    setSupervisorQuery('');
                                                    setShowSupervisorResults(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-slate-800">{supervisor.name}</p>
                                                <p className="text-xs text-slate-500">{supervisor.email}</p>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-3 text-xs text-slate-500">No supervisor users match your search.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedSupervisor ? (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                                <span className="text-sm font-medium text-purple-800">{selectedSupervisor.name}</span>
                                <span className="text-xs text-purple-600">{selectedSupervisor.email}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, supervisorId: null })}
                                    title="Clear selected supervisor"
                                    aria-label="Clear selected supervisor"
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">No supervisor selected.</p>
                        )}

                        {supervisors.length === 0 && (
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                No supervisor users found in the database.
                            </p>
                        )}
                    </div>

                    <MemberSearch
                        allUsers={users.filter((user) => user.role !== 'supervisor')}
                        selectedIds={formData.teamMembers}
                        onChange={(ids) => setFormData({ ...formData, teamMembers: ids })}
                    />
                </>
            )}
        </div>
    );
};

// Step 3: Review
const Step3Review: React.FC<{
    formData: ProjectFormData;
    users: User[];
}> = ({ formData, users }) => {
    const selectedUsers = users.filter(u => formData.teamMembers.includes(u.id));
    const selectedSupervisor = users.find(
        (user) => user.id === formData.supervisorId && user.role === 'supervisor',
    );

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
                        <div>
                            <span className="text-xs text-slate-500">Supervisor:</span>
                            <p className="text-sm text-slate-700">
                                {selectedSupervisor ? selectedSupervisor.name : 'Not selected'}
                            </p>
                        </div>
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
