# Clovio Dashboard - Implementation Guide

## Overview

The Clovio project management dashboard is a comprehensive, modern React application that visualizes project progress, team performance, and project risks without cluttering the UI. Built with **Tailwind CSS**, the dashboard is fully responsive, with 2-column layout on desktop and 1-column on mobile.

---

## Architecture

### Component Structure

```
Dashboard (Main Orchestrator)
├── HeroSection (Full Width)
│   ├── Project Name & Status
│   ├── Main Progress Bar (Animated)
│   ├── Tasks/Milestones Completion
│   └── Deadline Countdown
├── PredictionCard (Left Column)
│   ├── Predicted Completion Date
│   ├── Status Indicator
│   └── Progress Trend
├── QuickStatsCard (Left Column)
│   ├── Avg Completion Time
│   ├── Skill Gaps Count
│   └── Total Tasks
├── WorkloadDistribution (Left Column)
│   ├── Tasks Assigned per Member
│   ├── Completion Rate
│   └── Overload Indicators
├── TeamPerformance (Right Column)
│   ├── Tasks Completed per Member
│   ├── Top Performer Highlight
│   └── Performance Metrics
├── RisksBottlenecks (Full Width)
│   ├── Overdue Tasks Count
│   ├── Stuck Tasks
│   ├── Not Started Tasks
│   └── Risk Level Indicator
├── ActivityTrends (Full Width)
│   ├── SVG Line Chart
│   ├── Velocity Calculation
│   └── Weekly Comparison
└── AIInsightsPanel (Full Width)
    ├── AI-Generated Insights
    ├── Color-Coded Categories
    └── Recommended Actions
```

### Data Flow

```
ProjectTrackingDashboard
    ↓
Dashboard Component
    ├─→ fetchTaskTrends() [API/Mock]
    ├─→ fetchAIInsights() [API/Mock]
    └─→ Sub-components use metrics from:
        - calcTeamWorkload()
        - calcTaskCompletion()
        - predictCompletionDate()
        - etc.
```

---

## Components

### 1. HeroSection
**File**: `src/components/HeroSection.tsx`

Displays the project banner with key metrics at a glance.

**Inputs**:
- `project`: Project metadata (name, module, status, due date)
- `plan`: Milestone and task data
- `overallProgress`: Calculated overall progress percentage

**Features**:
- Status indicator with color coding (On Track/At Risk/Delayed)
- Animated progress bar with gradient
- Tasks: X/Y with mini progress bar
- Milestones: X/Y with mini progress bar
- Deadline countdown with color-coded urgency
- Risk warning banner (if any risk from AI)

### 2. PredictionCard
**File**: `src/components/PredictionCard.tsx`

Predicts project completion date based on velocity.

**Inputs**:
- `plan`: Project plan with milestones/tasks
- `trends`: Historical task completion data

**Calculations**:
- Velocity: tasks per week
- Predicted completion: based on remaining tasks and velocity
- Trend direction: improving/stable/slowing

**Color Scheme**:
- 🟢 Green: On Schedule
- 🟡 Orange: At Risk
- 📈 Improving trend

### 3. QuickStatsCard
**File**: `src/components/QuickStatsCard.tsx`

At-a-glance key statistics.

**Metrics**:
- Average task completion time (hours)
- Skill gaps count
- Total tasks
- List of missing skills for top gaps

### 4. WorkloadDistribution
**File**: `src/components/WorkloadDistribution.tsx`

Visualizes team member workload and capacity.

**Features**:
- Assigned tasks per member (with bar visualization)
- Completed tasks per member (with completion rate %)
- Complexity points
- Overload indicators (30%+ above average)
- Underutilization indicators (30%+ below average)

**Colors**:
- 🔴 Red: Overloaded
- 🔵 Blue: Normal
- 🟦 Underutilized

### 5. TeamPerformance
**File**: `src/components/TeamPerformance.tsx`

Highlights team member contributions.

**Features**:
- Completion rate per member
- In-progress task count
- Complexity contribution
- 🏆 Most productive member highlight
- Team summary stats

### 6. RisksBottlenecks
**File**: `src/components/RisksBottlenecks.tsx`

Identifies and prioritizes project risks.

**Risk Indicators**:
- 🚨 Critical: 10+ risk points
- 🔴 High: 6-9 risk points
- 🟡 Medium: 3-5 risk points
- 🟢 Low: <3 risk points

**Metrics**:
- Overdue tasks (tasks exceeding baseline hours)
- Stuck tasks (in-progress > 8 hours)
- Not started tasks
- Skill gaps

### 7. ActivityTrends
**File**: `src/components/ActivityTrends.tsx`

Displays task completion history and velocity trends.

**Features**:
- SVG-based line chart (no external dependencies)
- Two lines: Planned vs Completed tasks
- Grid with value ticks
- X-axis date labels
- Weekly velocity
- Week-over-week change
- Insights based on trend direction

**Chart Data**:
```typescript
trends: Array<{ 
  date: string;        // ISO date "YYYY-MM-DD"
  completed: number;   // Tasks completed
  planned: number;     // Tasks planned
}>
```

### 8. AIInsightsPanel
**File**: `src/components/AIInsightsPanel.tsx`

Displays AI-generated insights and recommendations.

**Insight Categories** (Auto-categorized by keywords):
- ⏱️ Delays
- 👥 Reassignments
- ⚡ Optimizations
- ⚠️ Warnings
- ✨ Successes

**Features**:
- Color-coded insight cards
- Auto-parsing of insight keywords
- Recommended actions
- Fallback to default insights if API unavailable

### 9. Dashboard (Main Container)
**File**: `src/components/Dashboard.tsx`

Orchestrates all components with:
- Responsive 2-column grid (lg breakpoint)
- Loading and error states
- API data fetching
- Mock data fallback

---

## Utilities

### Metrics Module
**File**: `src/utils/metrics.ts`

Provides all computed metrics for the dashboard.

#### Task Status & Progress
- `getTaskStatus(task)`: Returns "done" | "in-progress" | "todo"
- `calcOverallProgress(milestones)`: Percentage across all milestones
- `calcTaskCompletion(milestones)`: Returns { completed, total }
- `calcMilestoneCompletion(milestones)`: Returns { completed, total }

#### Deadline Countdown
- `calcDaysRemaining(dueDate)`: Days until deadline (negative if overdue)
- `getDeadlineStatus(daysRemaining)`: "on-track" | "warning" | "critical"

#### Team Performance
- `calcTeamWorkload(milestones)`: Workload per team member
- `findOverloadedMembers(workload)`: Members 30%+ above average
- `findUnderutilizedMembers(workload)`: Members 30%+ below average
- `findMostProductiveMember(workload)`: Member with highest completed tasks

#### Risks & Bottlenecks
- `countOverdueTasks(milestones)`: Tasks exceeding baseline hours
- `countNotStartedTasks(milestones)`: Todo tasks count
- `countStuckTasks(milestones)`: In-progress tasks > 8 hours
- `identifySkillGaps(milestones)`: Tasks with missing skills

#### Velocity & Trends
- `calcVelocity(trends)`: Tasks per week
- `predictCompletionDate(allTasks, velocity, recentTrends)`: Estimated completion
- `getProgressTrend(recentTrends)`: "improving" | "stable" | "slowing"
- `calcAvgCompletionTime(milestones)`: Average hours per task

---

## API Services

### Dashboard API Service
**File**: `src/services/dashboardApi.ts`

Fetch backend data with automatic mock fallbacks.

#### Functions

```typescript
// Fetch complete project plan
fetchProjectData(projectId): Promise<ProjectPlan>

// Fetch project milestones
fetchProjectMilestones(projectId): Promise<Milestone[]>

// Fetch project tasks
fetchProjectTasks(projectId): Promise<Task[]>

// Fetch AI-generated insights
fetchAIInsights(projectId): Promise<string[]>

// Fetch team workload metrics
fetchTeamWorkload(projectId): Promise<Record<string, WorkloadStats>>

// Fetch task completion trends
fetchTaskTrends(projectId): Promise<TrendData[]>
```

#### API Endpoints (to implement in backend)

```
GET     /api/v1/projects/:id
GET     /api/v1/projects/:id/tasks
GET     /api/v1/projects/:id/milestones
GET     /api/v1/projects/:id/insights
GET     /api/v1/projects/:id/team/workload
GET     /api/v1/projects/:id/trends
```

#### Error Handling
- All functions gracefully fall back to mock data if API unavailable
- Errors logged to console for debugging
- UI displays error banner but doesn't crash

---

## Styling & Responsive Design

### Tailwind Breakpoints Used
- `grid-cols-1` - Mobile (default)
- `md:grid-cols-2` - Tablet and up
- `lg:grid-cols-2` - Desktop and up

### Color Palette
- Green (#10B981): Success, on-track, positive
- Orange (#F59E0B): Warning, at-risk, attention needed
- Red (#EF4444): Critical, urgent, overdue
- Blue (#2563EB, #0891B2): Primary, info, neutral
- Cyan (#0d9488): Accent, trends
- Gray: Neutral backgrounds

### Visual Consistency
- All cards: `bg-white rounded-lg border border-gray-200 p-5`
- All section headers: `text-xs font-semibold text-gray-500 uppercase tracking-widest`
- All large numbers: `text-2xl font-bold text-gray-900` or color-specific
- All progress bars: `h-2 rounded-full bg-gray-100`

---

## Data Types

### ProjectPlan
```typescript
{
  project_name: string;
  milestones: Milestone[];
  overall_risk_warning?: string;
}
```

### Milestone
```typescript
{
  title: string;
  tasks: Task[];
  order?: number;
  progress?: number;           // 0-100
  phaseStatus?: "completed" | "active" | "upcoming";
}
```

### Task
```typescript
{
  name: string;
  description?: string;
  complexity: number;          // 1-10
  required_skills: string[];
  assigned_to?: string;
  assignment_reason?: string;
  is_skill_gap: boolean;
  hours?: number;              // Estimated duration
  priority?: "high" | "medium" | "low";
  status?: "done" | "in-progress" | "todo";
}
```

### TrendData
```typescript
{
  date: string;                // "YYYY-MM-DD"
  completed: number;           // Tasks completed that day
  planned: number;             // Tasks planned that day
}
```

---

## Integration Checklist

### For Backend Team
- [ ] Implement GET `/api/v1/projects/:id` endpoint
- [ ] Implement GET `/api/v1/projects/:id/tasks` endpoint
- [ ] Implement GET `/api/v1/projects/:id/milestones` endpoint
- [ ] Implement GET `/api/v1/projects/:id/insights` endpoint (or use mock)
- [ ] Implement GET `/api/v1/projects/:id/team/workload` endpoint
- [ ] Implement GET `/api/v1/projects/:id/trends` endpoint
- [ ] Set up CORS headers for frontend access
- [ ] Return data in exact formats specified above

### For Frontend Team
- [ ] Verify all components render correctly with mock data ✅
- [ ] Replace mock insights with API calls when backend ready
- [ ] Update `VITE_API_BASE_URL` environment variable
- [ ] Test error handling and fallback to mock data
- [ ] Add proper error boundaries (optional)
- [ ] Implement refresh functionality
- [ ] Add real-time updates with WebSocket (optional)

### Environment Setup
```bash
# .env.local or .env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Usage Example

### Using the Dashboard Component

```tsx
import Dashboard from "./components/Dashboard";
import { MOCK_PLAN } from "./types/mockData";

function ProjectPage() {
  return (
    <Dashboard 
      projectId="123" 
      plan={MOCK_PLAN}
      mockInsights={["Your custom insights here"]}
    />
  );
}
```

### In ProjectTrackingDashboard

```tsx
import Dashboard from "./components/Dashboard";

export default function ProjectTrackingDashboard() {
  // ... fetch project and plan ...
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <Dashboard projectId={id} plan={plan} />
      </div>
    </div>
  );
}
```

---

## Performance Considerations

1. **Mock Data Separation**: All mock data clearly marked for easy removal
2. **No Heavy Dependencies**: Uses vanilla SVG charts, Tailwind CSS only
3. **Async Data Fetching**: Non-blocking, with graceful fallbacks
4. **Responsive Grid**: Uses Tailwind's responsive utilities for minimal CSS
5. **Component Reusability**: All sub-components are self-contained

---

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live dashboard
2. **Export/Print**: PDF export of dashboard snapshot
3. **Customizable Views**: User preference for visible sections
4. **Animations**: Smooth transitions and loading states
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Dark Mode**: Theme toggle support
7. **Notifications**: Toast alerts for risk updates
8. **Advanced Charts**: More visualization options (Recharts, D3)
9. **Time Range Selection**: Historical data filtering
10. **Comparison View**: Compare multiple projects side-by-side

---

## Troubleshooting

### Components Not Rendering
- Check that all required props are provided
- Verify data structure matches TypeScript interfaces
- Check browser console for errors

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Verify postcss and autoprefixer are set up
- Check for CSS conflicts with existing styles

### API Integration Issues
- Verify backend endpoints return correct JSON format
- Check CORS headers on backend
- Use browser DevTools Network tab to debug
- API calls will gracefully fall back to mock data

### Performance Issues
- Monitor component re-renders with React DevTools Profiler
- Consider memoization for expensive calculations
- Lazy load chart component if needed

---

## File Summary

```
frontend/src/
├── components/
│   ├── HeroSection.tsx              ✅ Main hero banner
│   ├── PredictionCard.tsx           ✅ Completion prediction
│   ├── QuickStatsCard.tsx           ✅ Key metrics
│   ├── WorkloadDistribution.tsx     ✅ Team workload
│   ├── TeamPerformance.tsx          ✅ Member performance
│   ├── RisksBottlenecks.tsx         ✅ Risk analysis
│   ├── ActivityTrends.tsx           ✅ Trend visualization
│   ├── AIInsightsPanel.tsx          ✅ AI insights
│   └── Dashboard.tsx                ✅ Main orchestrator
├── services/
│   └── dashboardApi.ts              ✅ API service with fallbacks
├── utils/
│   └── metrics.ts                   ✅ All computed metrics
├── constants/
│   └── mockData.ts                  ✅ Mock data storage
└── types/
    └── index.ts                     ✅ TypeScript types
```

---

## Support & Questions

For questions about implementation, refer to inline code comments in each component. Most functions have comprehensive JSDoc documentation.

**Key Contact Points**:
- Dashboard architecture: Review Dashboard.tsx
- Metrics calculations: Review metrics.ts
- API integration: Review dashboardApi.ts
- Component styling: Review individual .tsx files

---

**Dashboard v1.0** - Built with ❤️ for Clovio Project Management
