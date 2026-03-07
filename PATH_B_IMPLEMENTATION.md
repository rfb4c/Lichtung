# Path B Implementation Plan

> **Status**: Phase 1 Complete (Cleanup) ✅
> **Next**: Phase 2 (Component Implementation)
> **Branch**: `feature/path-b-consensus-visualization`
> **Backup**: `backup/pre-path-b-cleanup`

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

## 🚧 Phase 2: Component Implementation (TODO)

### 2.1 Create DistributionChart Component

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

### 2.2 Update CommentSection Component

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

### 2.3 Update FeedItem Component

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

### 2.4 Create CSS Files

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

### 2.5 Data Migration

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

### Components
- [ ] Create `DistributionChart.tsx`
- [ ] Create `DistributionChart.module.css`
- [ ] Update `CommentSection.tsx` (add chart at top)
- [ ] Update `CommentSection.module.css`
- [ ] Update `FeedItem.tsx` (topic badge + dual buttons)
- [ ] Update `FeedItem.module.css`

### Data & Logic
- [ ] Add polling data fetching in `CommentSection`
- [ ] Add polling data fetching for "data-only" mode
- [ ] Implement dual button state management in `FeedItem`
- [ ] Test with 4-level, 5-level, 7-level polling data

### Testing
- [ ] Verify chart renders correctly with variable levels
- [ ] Verify warm color gradient is correct
- [ ] Verify bridging text displays
- [ ] Verify "Comments" button shows chart + comments
- [ ] Verify "Public Opinion" button shows chart only
- [ ] Verify reports without `topicId` still work (no badge, no public opinion button)

### Optional (Supabase)
- [ ] Run database migrations
- [ ] Insert sample data
- [ ] Update data fetching logic in components

---

## 🎨 Design Reference

See [产品设计文档](docs/00-Overview/产品设计文档.md):
- § 3.3: Comment section expanded state
- § 3.4: Independent data-only expansion
- § 6.1-6.3: Component code examples

---

## 🐛 Known Issues to Address

1. **CSS cleanup**: Remove unused styles for `SpectrumBar`, `DistributionTooltip` from `FeedItem.module.css`
2. **TypeScript**: Ensure no lingering references to old types
3. **Fallback data**: Ensure app works when Supabase is not configured

---

## 📝 Notes

- Current branch has **clean foundation** - no old design remnants
- All type definitions are Path B compliant
- Data structure follows Pew Research format
- Ready for component implementation

---

**Next Session**: Start with § 2.1 (Create DistributionChart Component)
