import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SupervisorContributionItem } from '../../types/supervisor';

interface Props {
    contributions: SupervisorContributionItem[];
    onClickMember?: (member: SupervisorContributionItem) => void;
}

export default function AtRiskWidget({ contributions, onClickMember }: Props) {
    // Flag students with < 20% contribution
    const atRiskMembers = useMemo(() => {
        return contributions.filter(m => m.contribution_percent < 20);
    }, [contributions]);

    if (atRiskMembers.length === 0) return null;

    return (
        <div className="bg-rose-50 border-b border-rose-200 px-8 py-3 flex items-start sm:items-center gap-3 animate-in slide-in-from-top-2 z-10 shadow-sm relative">
            <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg flex-shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm text-rose-800">
                <span className="font-bold uppercase tracking-wider text-[11px] mr-2">Attention Needed</span>
                {atRiskMembers.map((member, idx) => (
                    <React.Fragment key={member.user_id}>
                        <button 
                            onClick={() => onClickMember?.(member)}
                            className="font-semibold hover:underline hover:text-rose-600 transition-colors cursor-pointer inline"
                        >
                            {member.name}
                        </button>
                        <span className="text-rose-600/80 mx-1">
                            ({member.contribution_percent < 1 ? 'No tasks started' : 'Low engagement'})
                        </span>
                        {idx < atRiskMembers.length - 1 && <span className="mx-2 text-rose-300">•</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
