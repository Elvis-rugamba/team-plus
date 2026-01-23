# Architecture Documentation

## Feature-Based Folder Structure

This project uses a **feature-based** folder structure with **business logic separated from UI components** to organize code by domain/feature. This approach improves:

- **Scalability**: Easy to add new features without cluttering existing ones
- **Maintainability**: All related code is co-located
- **Team Collaboration**: Clear ownership boundaries
- **Code Reusability**: Shared components and hooks are explicitly separated
- **Testability**: Business logic is isolated and easy to unit test

```
src/
├── features/                    # Feature modules (domain-driven)
│   ├── members/                 # Member management feature
│   │   ├── components/          # UI components
│   │   │   ├── MembersPage.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberListItem.tsx
│   │   │   └── MemberForm.tsx
│   │   ├── hooks/               # Business logic hooks
│   │   │   ├── useMemberColumns.tsx
│   │   │   ├── useMemberFilters.ts
│   │   │   └── useMemberSearch.ts
│   │   └── index.ts             # Public API exports
│   │
│   ├── teams/                   # Team management feature
│   │   ├── components/
│   │   │   ├── TeamsPage.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamListItem.tsx
│   │   │   ├── TeamForm.tsx
│   │   │   └── TeamAssignment.tsx
│   │   ├── hooks/
│   │   │   ├── useTeamColumns.tsx
│   │   │   └── useTeamSearch.ts
│   │   └── index.ts
│   │
│   └── dashboard/               # Dashboard & statistics feature
│       └── ...
│
├── components/                  # Shared/Reusable components
│   └── shared/                  # Shared UI components
│       ├── ListingView/         # DataGrid-based listing
│       ├── SearchBar/           # Search input
│       ├── FilterPanel/         # Advanced filtering
│       ├── EmptyState/
│       ├── ViewModeToggle/
│       ├── ConfirmDialog/
│       └── LoadingSpinner/
│
├── hooks/                       # Shared custom hooks
│   ├── useMembers.ts            # Member data operations
│   ├── useTeams.ts              # Team data operations
│   ├── useLocalStorage.ts       # Data persistence
│   ├── useListingView.ts        # Listing UI logic
│   ├── useSearch.ts             # Search logic
│   └── useFilter.ts             # Filter logic
│
├── contexts/                    # State management
│   ├── AppContext.tsx
│   └── appReducer.ts
│
├── types/                       # TypeScript types
├── utils/                       # Utility functions
├── theme/                       # Material-UI theme
└── i18n/                        # Internationalization
```

## Business Logic Separation Pattern

### Principle: Keep Components Thin

Components should focus on **presentation** and **user interaction**, while **business logic** lives in custom hooks.

### Custom Hook Categories

#### 1. **Feature-Specific Hooks** (in `features/*/hooks/`)

Business logic specific to a feature:

- `useMemberColumns.tsx` - Column definitions for member table
- `useMemberFilters.ts` - Filter definitions for members
- `useMemberSearch.ts` - Search configuration for members

#### 2. **Shared Business Logic Hooks** (in `hooks/`)

Reusable business logic across features:

- `useSearch<T>` - Generic search functionality
- `useFilter<T>` - Generic filtering functionality
- `useListingView` - View mode and pagination logic

#### 3. **Data Hooks** (in `hooks/`)

Data fetching and mutations:

- `useMembers` - CRUD operations for members
- `useTeams` - CRUD operations for teams

## Universal Listing Features

The `ListingView` component provides consistent features across **all view modes** (Table, List, Grid):

### Features Available in ALL Views

- ✅ **Pagination**: TablePagination component for List/Grid, DataGrid pagination for Table
- ✅ **Configurable Page Sizes**: 10, 25, 50, 100 rows per page
- ✅ **Search**: Real-time filtering works in all modes
- ✅ **Filtering**: Advanced filters apply to all view modes
- ✅ **Sorting**: Available in Table view via DataGrid
- ✅ **Responsive**: All views adapt to screen size
- ✅ **Accessible**: Full keyboard navigation and ARIA labels

### View-Specific Features

**Table View (MUI DataGrid)**:

- Virtual scrolling for large datasets
- Column resizing and reordering
- Built-in filter UI per column

**List View**:

- Compact display with secondary information
- TablePagination at bottom

**Grid View**:

- Card-based layout with visual appeal
- TablePagination at bottom

## Form Components with Smart Autocomplete

The application uses intelligent autocomplete inputs for better UX and data consistency.

### CreatableAutocomplete Component

A reusable component located at `src/components/shared/CreatableAutocomplete/` that provides:

- ✅ **Select from existing options** with autocomplete filtering
- ✅ **Create new options** with "Add [value]" highlighted option
- ✅ **Confirmation modal** before adding new items
- ✅ **Editable input** in modal to modify value before adding
- ✅ **Session memory** - newly added items persist during form session
- ✅ **Case-insensitive matching** to prevent duplicates
- ✅ **Keyboard support** - Enter to confirm, Escape to cancel

## Advanced Search & Filtering

### Search Hook Pattern

```typescript
// Define searchable fields and custom logic
const searchConfig: SearchConfig<Member> = {
  searchableFields: ["name", "role", "skills", "email"],
  customSearchFn: (member, searchTerm) => {
    // Custom search logic
    return member.name.toLowerCase().includes(searchTerm);
  },
};

// Use in component
const searchedItems = useSearch(items, searchTerm, searchConfig);
```

### Filter Hook Pattern

```typescript
// Define filters with conditions
const filterDefinitions: FilterDefinition<Member>[] = [
  {
    id: "role",
    label: "Role",
    field: "role",
    condition: (member, value) => member.role === value,
    options: [
      { value: "developer", label: "Developer" },
      { value: "designer", label: "Designer" },
    ],
  },
];

// Use in component
const { filteredItems, applyFilter, clearAllFilters } = useFilter(
  items,
  filterDefinitions
);
```

## Pagination Logic

Pagination state and logic is handled by `useListingView`:

```typescript
const {
  page,
  rowsPerPage,
  paginatedItems,
  setPage,
  setRowsPerPage,
} = useListingView(items, 'table', 25);

// Pass to ListingView
<ListingView
  page={page}
  pageSize={rowsPerPage}
  onPageChange={setPage}
  onPageSizeChange={setRowsPerPage}
  ...
/>
```

## State Management Flow

```
User Action
    ↓
Component
    ↓
Business Logic Hook (useSearch, useFilter, etc.)
    ↓
Processed Data
    ↓
ListingView Component
    ↓
DataGrid (Table) | Card Grid | List
```

## Adding a New Feature with Business Logic

### 1. Create Feature Structure

```bash
mkdir -p src/features/new-feature/{components,hooks}
```

### 2. Define Business Logic Hooks

```typescript
// features/new-feature/hooks/useNewFeatureColumns.tsx
export function useNewFeatureColumns() {
  return useMemo(
    () => [
      // Column definitions
    ],
    [dependencies]
  );
}

// features/new-feature/hooks/useNewFeatureFilters.ts
export function useNewFeatureFilters() {
  return useMemo(
    () => [
      // Filter definitions
    ],
    [dependencies]
  );
}
```

### 3. Create Clean Component

```typescript
// features/new-feature/components/NewFeaturePage.tsx
export const NewFeaturePage = () => {
  // Data hooks
  const { items } = useNewFeatureData();

  // Business logic hooks
  const listingView = useListingView(items);
  const searchConfig = useNewFeatureSearchConfig();
  const searchedItems = useSearch(items, listingView.searchTerm, searchConfig);
  const columns = useNewFeatureColumns(handleEdit, handleDelete);

  // UI only - no business logic!
  return (
    <Box>
      <SearchBar value={listingView.searchTerm} onChange={listingView.setSearchTerm} />
      <ListingView items={searchedItems} columns={columns} ... />
    </Box>
  );
};
```

## Testing Strategy

### Unit Test Business Logic Hooks

```typescript
// features/members/hooks/useMemberFilters.test.ts
describe("useMemberFilters", () => {
  it("should filter by role", () => {
    const { result } = renderHook(() => useMemberFilters(roles, skills, teams));
    const filter = result.current.find((f) => f.id === "role");

    expect(filter.condition(member, "developer")).toBe(true);
  });
});
```

### Integration Test Components

```typescript
// features/members/components/MembersPage.test.tsx
describe("MembersPage", () => {
  it("should filter members by search term", () => {
    render(<MembersPage />);

    userEvent.type(screen.getByRole("searchbox"), "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });
});
```

## Performance Optimizations

1. **Memoized Business Logic**: All hooks use `useMemo` for expensive calculations
2. **Component Memoization**: Use `React.memo` for list items
3. **Virtual Scrolling**: DataGrid handles large datasets efficiently
4. **Code Splitting**: Features lazy-loaded
5. **Debounced Search**: Search triggers after typing stops

## Benefits of This Architecture

✅ **Testable**: Business logic is isolated and easy to unit test  
✅ **Reusable**: Hooks can be shared across features  
✅ **Maintainable**: Clear separation of concerns  
✅ **Scalable**: Easy to add new features or modify existing ones  
✅ **Type-Safe**: Full TypeScript support throughout  
✅ **DRY**: No duplicate logic across features  
✅ **Clean Components**: Components focus on UI, not logic
