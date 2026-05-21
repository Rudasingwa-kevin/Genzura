# Analytics - Real Data Implementation

## Overview
Converted the Analytics page from mock data to real calculations based on actual case data from the database.

## Changes Made

### Backend (`genzura-api`)

#### Modified Files:
- `src/services/caseService.ts` - Enhanced `getAnalytics()` method
- `src/controllers/caseController.ts` - Added user filtering

#### New Calculations:

**1. Average Resolution Days**
```typescript
avgResolutionDays: number
```
- Calculates average time (in days) from case filed date to resolution
- Only includes cases with status 'Resolved' or 'Archived'
- Formula: `sum(updatedAt - filedDate) / number of resolved cases`

**2. Win Rate**
```typescript
winRate: number (percentage)
```
- Percentage of successfully resolved cases out of all closed cases
- Formula: `(Resolved cases / Total closed cases) × 100`
- Closed cases = Resolved + Archived

**3. Trend Calculations**
```typescript
trends: {
  opened: number,    // % change in new cases (last 30d vs previous 30d)
  closed: number,    // % change in resolved cases (last 30d vs previous 30d)
  avgDays: number,   // Placeholder for historical comparison
  winRate: number    // Placeholder for historical comparison
}
```
- Compares last 30 days with previous 30 days
- Shows positive/negative percentage change

**4. Attorney Leaderboard**
```typescript
attorneyStats: [{
  name: string,
  initials: string,
  cases: number,        // Total cases (as lead attorney + team member)
  resolved: number,     // Number of resolved cases
  rate: number          // Success rate percentage
}]
```
- Only includes users with role 'Attorney' or 'Senior_Attorney'
- Combines cases where user is lead attorney AND team member
- Sorted by success rate (descending)
- Returns top 10 attorneys

**5. User Data Isolation**
- All analytics now filtered by `userId`
- Users only see statistics from their assigned cases
- Respects the same access control as cases/clients/documents

---

### Frontend (`genzura-web`)

#### Modified Files:
- `src/pages/AnalyticsPage.tsx`

#### Changes:

**1. Removed Hardcoded Values**

Before:
```typescript
avgDays: 28,  // Hardcoded
winRate: 85   // Hardcoded
```

After:
```typescript
avgDays: data.avgResolutionDays || 0,
winRate: data.winRate || 0
```

**2. Real Attorney Leaderboard**

Before:
```typescript
const leaderboard = useMemo(() => {
  return [
    { name: 'Sarah Miller', cases: 14, resolved: 12, rate: 92, initials: 'SM' },
    { name: 'James Wilson', cases: 22, resolved: 18, rate: 88, initials: 'JW' },
    { name: 'David Chen', cases: 9, resolved: 7, rate: 82, initials: 'DC' },
  ];
}, []);
```

After:
```typescript
const leaderboard = useMemo(() => {
  if (!data?.attorneyStats) return [];
  return data.attorneyStats;
}, [data]);
```

**3. Dynamic Trend Indicators**

Before:
```typescript
trend="+8%"  trendUp
trend="+12%" trendUp
```

After:
```typescript
trend={kpi.trends.opened > 0 ? `+${kpi.trends.opened}%` : `${kpi.trends.opened}%`}
trendUp={kpi.trends.opened >= 0}
```

**4. Empty State Handling**
- Added message when no attorney data available
- Shows loading skeletons during data fetch
- Graceful handling of zero cases

---

## API Response Structure

```typescript
{
  totalCases: number,
  statusCounts: [{ status: string, _count: number }],
  priorityCounts: [{ priority: string, _count: number }],
  volumeByMonth: [{ month: string, count: number }],
  avgResolutionDays: number,
  winRate: number,
  trends: {
    opened: number,
    closed: number,
    avgDays: number,
    winRate: number
  },
  attorneyStats: [{
    name: string,
    initials: string,
    cases: number,
    resolved: number,
    rate: number
  }]
}
```

---

## What's Now Real:

✅ **Cases Opened** - Real count from database  
✅ **Cases Closed** - Real count of resolved cases  
✅ **Average Resolution Days** - Calculated from actual case dates  
✅ **Win Rate** - Calculated from resolved vs closed cases  
✅ **Trend Indicators** - Calculated by comparing 30-day periods  
✅ **Attorney Leaderboard** - Real attorney performance data  
✅ **Case Velocity Chart** - Real monthly volume data  
✅ **User-Specific Data** - Filtered by user assignment  

---

## Example Results:

### For a user with cases assigned:
```json
{
  "totalCases": 3,
  "avgResolutionDays": 45,
  "winRate": 67,
  "trends": {
    "opened": 50,     // +50% new cases vs last period
    "closed": -25     // -25% closed cases vs last period
  },
  "attorneyStats": [
    {
      "name": "James Wilson",
      "initials": "JW",
      "cases": 3,
      "resolved": 2,
      "rate": 67
    }
  ]
}
```

### For a user with no cases:
```json
{
  "totalCases": 0,
  "avgResolutionDays": 0,
  "winRate": 0,
  "trends": { "opened": 0, "closed": 0, "avgDays": 0, "winRate": 0 },
  "attorneyStats": []
}
```

---

## Testing:

1. **Login as user with cases** (e.g., `j.wilson@genzura.law`)
   - Should see real case counts
   - Should see calculated average days
   - Should see calculated win rate
   - Should see trend percentages based on 30-day comparison

2. **Login as user without cases** (e.g., `s.miller@genzura.law`)
   - Should see all zeros
   - Should see "No attorney performance data available" message

3. **Check attorney leaderboard**
   - Should show real attorneys with actual case data
   - Should be sorted by success rate
   - Should show only attorneys/senior attorneys

---

## Future Enhancements:

- Add historical trend calculation for avgDays and winRate
- Add date range filtering (currently hardcoded to 30-day periods)
- Add more detailed attorney statistics (pending, active, archived cases)
- Add chart for attorney performance over time
- Add comparison view between attorneys

---

## Notes:

- All analytics respect user data isolation
- Trend calculations require at least 60 days of data for meaningful results
- Win rate calculation only considers closed cases (Resolved + Archived)
- Attorney leaderboard limited to top 10 performers
