/**
 * MOCK DATA EXPORT
 * 
 * This constant provides default mock insights for the dashboard.
 * Replace or extend these when integrating with real API.
 */

export const MOCK_INSIGHTS = [
  "Project is maintaining steady progress with current velocity",
  "Consider knowledge-sharing sessions to reduce bus factor risks",
  "Team capacity is well-distributed across milestones",
  "No critical blockers identified - keep momentum going",
];

export const MOCK_TRENDS = (() => {
  const trends = [];
  const today = new Date();
  
  for (let i = 20; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 6) + 2,
      planned: Math.floor(Math.random() * 8) + 3,
    });
  }
  
  return trends;
})();
