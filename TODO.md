# Lichtung - TODO List

## Phase 2 Status: ✅ COMPLETED
- [x] DistributionChart component
- [x] CommentSection with pinned chart
- [x] FeedItem with topic badge and dual buttons
- [x] Static JSON data integration

## Phase 3: High Priority

### 🎯 Topic Matching Algorithm (CRITICAL)
**Status**: 🔴 Not Started
**Priority**: HIGH
**Effort**: Medium (4-8 hours)

**Current Problem**:
- Reports manually specify `topicId` in JSON (hardcoded)
- No automatic matching based on content

**Solution**:
- Implement keyword-based matching algorithm
- Use `topic.tagKeywords` to scan `report.title` and `report.summary`
- Require 2+ keyword matches for topic assignment

**Files to Create/Modify**:
- [ ] `src/lib/matchers.ts` - New matching utility
- [ ] `src/App.tsx` - Call matcher after fetching reports
- [ ] `src/types/index.ts` - Add MatchingConfig type (optional)

**Reference**: See `PATH_B_IMPLEMENTATION.md § 3.1`

---

## Phase 3: Medium Priority

### Add More Topics & Polling Data
- [ ] Immigration (5-level scale)
- [ ] Healthcare (4-level scale)
- [ ] Economic Policy (6-level scale)

### UI Enhancements
- [ ] Loading skeleton for chart
- [ ] Animation when chart expands
- [ ] Tooltip on hover over bars (show exact percentage)

### Data Validation
- [ ] Validate distribution percentages sum to 100%
- [ ] Validate scaleLabels.length === distribution.length

---

## Phase 4: Future (Optional)

### Supabase Migration
- [ ] Create `topics` table
- [ ] Create `polling_data` table
- [ ] Update `reports` table schema
- [ ] Insert sample data
- [ ] Update App.tsx to use database instead of JSON

### Advanced Matching
- [ ] ML-based topic classification
- [ ] Multi-topic support (report matches multiple topics)
- [ ] Confidence scores for matches

### Analytics
- [ ] Track which topics users engage with most
- [ ] Track Public Opinion button vs Comments button clicks
- [ ] A/B test different bridging text phrasing

---

**Last Updated**: 2026-03-07
**Current Branch**: `feature/path-b-consensus-visualization`
