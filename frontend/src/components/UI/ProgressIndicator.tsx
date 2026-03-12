import React from 'react';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: Array<{ label: string; description: string }>;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <React.Fragment key={index}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${isCompleted
                                        ? 'bg-purple-600 text-white'
                                        : isCurrent
                                            ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p
                                        className={`text-sm font-medium ${isCurrent ? 'text-purple-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{step.description}</p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 px-2 -mt-16">
                                    <div
                                        className={`h-0.5 transition-all ${stepNumber < currentStep ? 'bg-purple-600' : 'bg-slate-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressIndicator;
