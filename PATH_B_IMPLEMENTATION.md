# Path B Implementation Plan

> **Status**: Phase 2 Complete (Component Implementation) ✅
> **Next**: Phase 3 (Topic Matching Algorithm)
> **Branch**: `feature/path-b-consensus-visualization`
> **Backup**: `backup/pre-path-b-cleanup`
> **Last Updated**: 2026-03-07

---

## ✅ Phase 1: Cleanup (COMPLETED)

### What was done:
1. ✅ Created backup branch `backup/pre-path-b-cleanup`
2. ✅ Deleted old design files:
   - `SpectrumBar.tsx` + CSS
   - `DistributionTooltip.tsx` + CSS
   - `events.json`
3. ✅ Updated type definitions ([types/index.ts](src/types/index.ts)):
   - Replaced `Event` → `Topic`
   - Replaced `Distribution` → `PollingData` (4-7 levels)
   - Removed `Stance` type
   - Updated `Report` interface (removed `stance`, added optional `topicId`)
4. ✅ Updated data mappers ([lib/mappers.ts](src/lib/mappers.ts)):
   - Added `TopicRow`, `PollingDataRow`
   - Added `mapTopic()`, `mapPollingData()`
   - Updated `mapReport()` to use `topic_id`
5. ✅ Cleaned up [App.tsx](src/App.tsx):
   - Replaced `events` → `topics`
   - Updated fetch logic to use `topics` table
   - Changed prop passing to `FeedItem`
6. ✅ Cleaned up [FeedItem.tsx](src/components/FeedItem.tsx):
   - Removed stance tags display
   - Removed tooltip hover logic
   - Removed all references to `DistributionTooltip`
7. ✅ Created new data file [app-data.json](src/data/app-data.json):
   - Sample topics (Gun Control, Abortion, Climate)
   - Sample polling data (Pew Research format)
   - Sample reports

---

## ✅ Phase 2: Component Implementation (COMPLETED)

### 2.1 ✅ Create DistributionChart Component

**File**: `src/components/DistributionChart.tsx`

**Features**:
- Accept `PollingData` prop
- Render horizontal bar chart with 4-7 levels (variable)
- Use warm neutral color gradient (Sand → Plum Grey)
- Display bridging text above chart
- Show source attribution below

**Design specs**:
- Bar height: 24px, gap: 8px
- Border radius: 4px (right side only)
- Background: `#F8F9FA`
- Border: 1px solid `#E8E8E8`
- Padding: 16px

**Color generation function**:
```typescript
function getBarColors(count: number): string[] {
  const warmEnd = [212, 165, 116]; // #D4A574 Sand
  const coolEnd = [123, 107, 138];  // #7B6B8A Plum Grey
  return Array.from({ length: count }, (_, i) => {
    const ratio = count === 1 ? 0.5 : i / (count - 1);
    const r = Math.round(warmEnd[0] + (coolEnd[0] - warmEnd[0]) * ratio);
    const g = Math.round(warmEnd[1] + (coolEnd[1] - warmEnd[1]) * ratio);
    const b = Math.round(warmEnd[2] + (coolEnd[2] - warmEnd[2]) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  });
}
```

**Reference**: [产品设计文档 § 6.2](docs/00-Overview/产品设计文档.md#62-distributionchart-组件n-档可变直方图)

---

### 2.2 ✅ Update CommentSection Component

**File**: `src/components/CommentSection.tsx`

**Changes**:
1. Add `topicId` prop
2. Fetch `PollingData` for the topic
3. Render `DistributionChart` at the top (fixed, non-collapsible)
4. Keep existing comment list below

**Structure**:
```tsx
<div className={styles.commentSection}>
  {/* Pinned chart at top */}
  {pollingData && (
    <div className={styles.chartPinned}>
      <DistributionChart pollingData={pollingData} />
    </div>
  )}

  {/* Comment list */}
  <div className={styles.commentsList}>
    {/* existing comments */}
  </div>

  {/* Comment input */}
  <CommentInput ... />
</div>
```

**Data fetching**:
```typescript
const [pollingData, setPollingData] = useState<PollingData | null>(null);

useEffect(() => {
  if (!topicId) return;
  // Fetch from polling_data table where topic_id = topicId
  // Or fallback to app-data.json
}, [topicId]);
```

**Reference**: [产品设计文档 § 6.3](docs/00-Overview/产品设计文档.md#63-commentsection-组件)

---

### 2.3 ✅ Update FeedItem Component

**File**: `src/components/FeedItem.tsx`

**Add features**:

#### A. Topic Badge (if topic matched)
```tsx
{topic && (
  <span className={styles.topicBadge}>
    {topic.name}
  </span>
)}
```

**Style**:
- Background: `#F3E8FD`
- Color: `#7C3AED`
- Font size: 13px
- Padding: 2px 8px
- Border radius: 12px

#### B. Dual Buttons (replace single comment button)

**When topic matched**:
```tsx
<div className={styles.actions}>
  {/* Comment button - expands comments + chart */}
  <button onClick={handleToggleComments}>
    <MessageCircle />
    <span>Comments ({commentCount})</span>
  </button>

  {/* Public Opinion button - expands chart only */}
  {topic && (
    <button onClick={handleToggleDataOnly}>
      <BarChart2 />
      <span>Public Opinion</span>
    </button>
  )}

  {/* other buttons... */}
</div>
```

**State management**:
```typescript
const [viewMode, setViewMode] = useState<'closed' | 'comments' | 'data-only'>('closed');

const handleToggleComments = () => {
  setViewMode(viewMode === 'comments' ? 'closed' : 'comments');
};

const handleToggleDataOnly = () => {
  setViewMode(viewMode === 'data-only' ? 'closed' : 'data-only');
};
```

**Rendering logic**:
```tsx
{viewMode === 'comments' && (
  <CommentSection reportId={report.id} topicId={report.topicId} />
)}

{viewMode === 'data-only' && topic && (
  <DistributionChart pollingData={/* fetch by topicId */} />
)}
```

**Reference**: [产品设计文档 § 6.1](docs/00-Overview/产品设计文档.md#61-feeditem-组件)

---

### 2.4 ✅ Create CSS Files

#### `DistributionChart.module.css`
- Chart container background, padding, border
- Bar styles (height, gap, border-radius)
- Label styles (bridging text, source note)

#### Update `CommentSection.module.css`
- Add `.chartPinned` styles
- Margin between chart and comments

#### Update `FeedItem.module.css`
- Add `.topicBadge` styles
- Update `.actions` button styles

---

### 2.5 ⚠️ Data Migration (SKIPPED - Using Static JSON)

**Option A: Static JSON (for demo)**
- Use `app-data.json` as fallback
- No Supabase migration needed

**Option B: Supabase (for production)**

Run migrations:
```sql
-- Create topics table
CREATE TABLE topics (
  id text PRIMARY KEY,
  name text NOT NULL,
  scope text NOT NULL,
  tag_keywords text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create polling_data table
CREATE TABLE polling_data (
  id text PRIMARY KEY,
  topic_id text NOT NULL REFERENCES topics(id),
  source text NOT NULL,
  survey_year integer NOT NULL,
  geographic_scope text NOT NULL,
  scale_labels text[] NOT NULL,
  distribution integer[] NOT NULL,
  bridging_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update reports table
ALTER TABLE reports
  DROP COLUMN event_id,
  DROP COLUMN stance,
  ADD COLUMN topic_id text REFERENCES topics(id);

-- Drop events table
DROP TABLE events;
```

Insert sample data from `app-data.json`.

**Reference**: [技术设计文档 § 2.4](docs/00-Overview/技术设计文档.md#24-path-b-数据表待实现)

---

## 📋 Implementation Checklist

### Components ✅ ALL COMPLETE
- [x] Create `DistributionChart.tsx`
- [x] Create `DistributionChart.module.css`
- [x] Update `CommentSection.tsx` (add chart at top)
- [x] Update `CommentSection.module.css`
- [x] Update `FeedItem.tsx` (topic badge + dual buttons)
- [x] Update `FeedItem.module.css`

### Data & Logic ✅ ALL COMPLETE
- [x] Add polling data fetching in `CommentSection`
- [x] Add polling data fetching for "data-only" mode
- [x] Implement dual button state management in `FeedItem`
- [x] Test with 3-level (Gun Control), 4-level (Abortion) polling data

### Testing ✅ ALL COMPLETE
- [x] Verify chart renders correctly with variable levels
- [x] Verify warm color gradient is correct
- [x] Verify bridging text displays
- [x] Verify "Comments" button shows chart + comments
- [x] Verify "Public Opinion" button shows chart only
- [x] Verify reports without `topicId` still work (no badge, no public opinion button)

### Optional (Supabase) ⚠️ DEFERRED
- [ ] Run database migrations (deferred to production)
- [ ] Insert sample data (using static JSON instead)
- [ ] Update data fetching logic in components (fallback implemented)

---

## 🎨 Design Reference

See [产品设计文档](docs/00-Overview/产品设计文档.md):
- § 3.3: Comment section expanded state
- § 3.4: Independent data-only expansion
- § 6.1-6.3: Component code examples

---

## ✅ Phase 2 Summary

### What Was Completed (2026-03-07)

**New Components**:
- ✅ [DistributionChart.tsx](src/components/DistributionChart.tsx) - Variable-level horizontal bar chart (3-7 levels)
- ✅ [DistributionChart.module.css](src/components/DistributionChart.module.css) - Chart styling with warm gradient

**Updated Components**:
- ✅ [CommentSection.tsx](src/components/CommentSection.tsx) - Added pinned chart at top
- ✅ [CommentSection.module.css](src/components/CommentSection.module.css) - Added `.chartPinned` styles
- ✅ [FeedItem.tsx](src/components/FeedItem.tsx) - Added topic badge + dual buttons (Comments / Public Opinion)
- ✅ [FeedItem.module.css](src/components/FeedItem.module.css) - Added `.topicBadge`, `.actionLabel`, `.dataOnlySection`

**Infrastructure**:
- ✅ [App.tsx](src/App.tsx) - Added error handling for missing Supabase tables (auto-fallback to JSON)
- ✅ Static JSON data integration ([app-data.json](src/data/app-data.json))

**Key Features Implemented**:
- 🎨 Warm-to-cool gradient color system (Sand #D4A574 → Plum Grey #7B6B8A)
- 📊 Variable-level polling data visualization (3-7 levels)
- 🏷️ Topic badge for matched reports
- 💬 Dual interaction modes (Comments vs Public Opinion)
- 🔄 Graceful fallback when Supabase tables don't exist

---

## 🐛 Known Limitations

1. **Topic Matching**: Currently static (reports manually specify `topicId`)
   - See § 3.1 for planned automatic matching algorithm
2. **Supabase Tables**: Not created yet (using static JSON for demo)
   - Optional migration available in § 2.5
3. **Sample Data**: Limited to 3 topics and 3 reports
   - Expand in future phases

---

## 📝 Notes

- ✅ All Phase 1 & 2 objectives achieved
- ✅ Demo-ready with static JSON data
- ⚠️ Topic matching algorithm is next priority (Phase 3)
- 🔧 Supabase migration optional for production deployment

---

## 🔮 Future Work (Phase 3+)

### 3.1 Topic Matching Algorithm (HIGH PRIORITY)

**Current Status**: ⚠️ Static matching - reports manually specify `topicId` in JSON

**Goal**: Automatic topic matching based on report content

**Implementation Strategy**:
```typescript
// Pseudo-code for matching algorithm
function matchTopicToReport(report: Report, topics: Topic[]): Topic | undefined {
  const content = `${report.title} ${report.summary}`.toLowerCase();

  for (const topic of topics) {
    const matchCount = topic.tagKeywords.filter(keyword =>
      content.includes(keyword.toLowerCase())
    ).length;

    // If 2+ keywords match, assign topic
    if (matchCount >= 2) {
      return topic;
    }
  }

  return undefined;
}
```

**Key Considerations**:
- Matching threshold: Require 2+ keyword matches to reduce false positives
- Case-insensitive matching
- Partial word matching (e.g., "firearms" should match "firearm")
- Disambiguation when multiple topics match (choose topic with most keyword hits)
- Future: ML-based semantic matching for higher accuracy

**Implementation Options**:
- **Option A** (Recommended for demo): Client-side matching in `App.tsx` after fetching reports
- **Option B**: Server-side matching when inserting reports into database
- **Option C**: Separate microservice (for production scale)

**Files to Create/Modify**:
- `src/lib/matchers.ts` - New file for matching utilities
- `src/App.tsx` - Call matcher in `fetchData()` function
- `src/types/index.ts` - Optional: Add `MatchingConfig` type

**Data Reference**:
- Topic `tagKeywords` are defined in [app-data.json](src/data/app-data.json)
- Example: Gun Control has keywords: `["gun", "firearm", "second amendment", "background check", "assault weapon"]`

**Testing Strategy**:
- Unit tests for matcher with sample reports
- Edge cases: No matches, multiple matches, partial word matches

---

**Next Session**: Start with § 2.1 (Create DistributionChart Component)
