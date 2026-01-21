# team+ | Efficient Team Management

A modern, feature-rich team management application built with React 18, TypeScript, and Material-UI. Manage teams and members efficiently with advanced features like drag & drop assignment, statistics dashboard, dark mode, and multi-language support.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Material-UI](https://img.shields.io/badge/Material--UI-5.15-007FFF)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Functionality

- **Team Management**: Create, edit, and delete teams with customizable colors and descriptions
- **Member Management**: Manage team members with smart autocomplete inputs:
  - **Role Selection**: Autocomplete with existing roles or create new ones
  - **Skills Management**: Multi-select autocomplete with visual chips (comma-separated)
  - Availability status and contact information
- **Team Assignment**: Assign/remove members to/from teams with intuitive drag & drop interface
- **Multi-member Assignment**: Assign multiple members to teams simultaneously using checkboxes

### User Experience

- **Multiple View Modes**: Switch between Table (MUI DataGrid), List, and Grid views for optimal data visualization
- **Advanced Search**: Real-time search across name, role, skills, and email fields (works in all view modes)
- **Advanced Filtering**: Multi-select filters for roles, skills, availability, and teams with visual chips (works in all view modes)
- **Universal Pagination**: Pagination with configurable page sizes (10, 25, 50, 100) works in Table, List, AND Grid views
- **Responsive Design**: Fully responsive UI that works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Internationalization**: Full support for English and German languages

### Data & Analytics

- **Statistics Dashboard**: Comprehensive analytics including:
  - Total members, teams, and unique skills
  - Average team size
  - **Enhanced Skill Distribution** (3 visualizations):
    - Pie chart showing top 5 skills by member count
    - Vertical bar chart displaying top 10 most common skills
    - **NEW**: Horizontal bar chart with top 15 skills (detailed view)
  - Availability breakdown with color-coded pie chart
  - Role distribution with horizontal bar chart
  - **Team size visualization with team colors**: Each team's bar uses its assigned color
- **Data Export**: Export all data in JSON or CSV format
- **Data Persistence**: Automatic saving to localStorage with IndexedDB fallback

### Technical Features

- **Error Boundary**: Comprehensive error handling with user-friendly error pages
- **Lazy Loading**: Optimized performance with code splitting and lazy component loading
- **Memoization**: Performance-optimized with React.memo and useMemo hooks
- **Accessibility (A11y)**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Type Safety**: Strict TypeScript mode for maximum type safety
- **Custom Hooks**: Reusable business logic with custom React hooks
- **Testing**: Comprehensive unit and E2E test coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server (opens browser automatically)
npm start
```

The application will automatically open at [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
# Development
npm start              # Start development server with hot reload
npm run dev           # Alternative development server command

# Production
npm run build         # Build for production (outputs to /dist)
npm run preview       # Preview production build locally

# Testing
npm test              # Run unit tests with coverage
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run E2E tests with Playwright
npm run test:e2e:ui   # Run E2E tests with Playwright UI

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checking
```

## 🏗️ Architecture Overview

### Feature-Based Structure

The application uses a **feature-based folder structure** where code is organized by domain/feature rather than technical type. This improves scalability, maintainability, and team collaboration.

**Benefits:**

- Clear feature boundaries
- Easy to add new features
- Co-located related code
- Explicit shared components

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

### Component Structure

```
src/
├── features/              # Feature modules (domain-driven)
│   ├── members/           # Member management feature
│   │   ├── components/
│   │   │   ├── MembersPage.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberListItem.tsx
│   │   │   └── MemberForm.tsx
│   │   └── index.ts       # Public API
│   ├── teams/             # Team management feature
│   │   ├── components/
│   │   │   ├── TeamsPage.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamListItem.tsx
│   │   │   ├── TeamForm.tsx
│   │   │   └── TeamAssignment.tsx
│   │   └── index.ts
│   └── dashboard/         # Dashboard & statistics
│       ├── components/
│       └── index.ts
├── components/            # Shared components
│   ├── shared/            # Reusable UI components
│   │   ├── ListingView/   # Generic list component
│   │   ├── EmptyState/
│   │   ├── ViewModeToggle/
│   │   ├── ConfirmDialog/
│   │   └── LoadingSpinner/
│   └── layout/            # Layout components
│       └── AppLayout.tsx
├── contexts/              # State management
│   ├── AppContext.tsx
│   └── appReducer.ts
├── hooks/                 # Custom hooks
│   ├── useMembers.ts
│   ├── useTeams.ts
│   └── useLocalStorage.ts
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── theme/                 # Material-UI theme
│   ├── tokens.ts          # Design tokens
│   └── index.ts
└── i18n/                  # Internationalization
```

### State Management

The application uses **Context API with useReducer** for global state management:

```
User Action → Component → dispatch(action) → appReducer →
New State → Context Update → Component Re-render → localStorage Save
```

**Key Features:**

- Centralized state management
- Predictable state updates through actions
- Type-safe action dispatching
- Automatic localStorage persistence

### Custom Hooks

Reusable business logic is encapsulated in custom hooks:

- **`useMembers`**: Member CRUD operations, filtering, and queries
- **`useTeams`**: Team CRUD operations and member assignments
- **`useLocalStorage`**: Data persistence with error handling
- **`useAppContext`**: Access to global state and dispatch

### Business Logic Architecture

**Separation of Concerns**: Business logic is extracted from components into custom hooks:

```typescript
// Business logic hooks (reusable)
const listingView = useListingView(items, 'table', 25);
const searchedItems = useSearch(items, searchTerm, searchConfig);
const { filteredItems, applyFilter } = useFilter(items, filterDefinitions);

// UI Component (thin, focused on presentation)
<ListingView items={filteredItems} columns={columns} ... />
```

**Benefits:**

- ✅ **Testable**: Business logic easily unit tested
- ✅ **Reusable**: Hooks shared across features
- ✅ **Clean**: Components focus on UI, not logic
- ✅ **Type-Safe**: Full TypeScript support

### Reusable Components

**ListingView with MUI DataGrid**: Handles Table (DataGrid), List, and Grid modes

- Built-in sorting and pagination
- Virtual scrolling for performance
- Responsive and accessible

**SearchBar**: Reusable search input with debouncing
**FilterPanel**: Advanced multi-select filtering with visual chips

## 🎨 Customizing Design Tokens

The application uses a centralized design token system for easy customization:

```typescript
// src/theme/tokens.ts
export const designTokens = {
  colors: {
    primary: { main: "#1976d2", light: "#42a5f5", dark: "#1565c0" },
    secondary: { main: "#9c27b0", light: "#ba68c8", dark: "#7b1fa2" },
    // ... more colors
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeights: { light: 300, regular: 400, medium: 500, bold: 700 },
  },
  spacing: { unit: 8, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borders: { radius: { sm: 4, md: 8, lg: 12, xl: 16 } },
  shadows: {
    /* predefined shadows */
  },
  transitions: {
    /* animation timings */
  },
};
```

**To customize:**

1. Edit `src/theme/tokens.ts` with your brand colors, fonts, and spacing
2. Changes automatically apply across the entire application
3. Both light and dark modes adapt to your tokens

## 📊 Data Structure

### Member

```typescript
{
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  email?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Team

```typescript
{
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}
```

### App State

```typescript
{
  members: Record<string, Member>;
  teams: Record<string, Team>;
  darkMode: boolean;
  language: "en" | "de";
}
```

## 🧪 Testing

### Unit Tests

Run unit tests with coverage:

```bash
npm test
```

**Coverage thresholds:**

- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

**Test files:**

- `src/tests/utils/` - Utility function tests
- `src/tests/contexts/` - State management tests
- `src/tests/components/` - Component tests

### E2E Tests

Run end-to-end tests with Playwright:

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui
```

**E2E test suites:**

- `e2e/app.spec.ts` - Navigation, theme, and language switching
- `e2e/members.spec.ts` - Member CRUD operations
- `e2e/teams.spec.ts` - Team CRUD and assignment operations
- `e2e/export.spec.ts` - Data export functionality

**Browsers tested:**

- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## ♿ Accessibility

The application follows WCAG 2.1 Level AA guidelines:

- ✅ Semantic HTML elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatible
- ✅ Color contrast ratios meet standards
- ✅ Responsive font sizing
- ✅ Skip navigation links

## 🌍 Internationalization

Currently supported languages:

- 🇬🇧 English (en)
- 🇩🇪 German (de)

**Adding a new language:**

1. Create a new locale file: `src/i18n/locales/[lang].json`
2. Copy the structure from `en.json` and translate
3. Register in `src/i18n/index.ts`:

```typescript
import newLang from "./locales/[lang].json";

i18n.use(initReactI18next).init({
  resources: {
    // ... existing languages
    [lang]: { translation: newLang },
  },
});
```

## 🚢 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The optimized build will be created in the `dist/` directory with:

- Minified JavaScript and CSS
- Code splitting for optimal loading
- Tree-shaking to remove unused code
- Asset optimization

## 📦 Dependencies

### Core

- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety (strict mode)
- **Material-UI 5.15** - UI component library
- **MUI X Data Grid 6.19** - Advanced table component
- **React Router 6** - Client-side routing
- **i18next** - Internationalization

### Utilities

- **@dnd-kit** - Drag and drop functionality
- **@mui/x-charts** - Data visualization
- **idb** - IndexedDB wrapper

### Development

- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **ESLint** - Code linting

## 🔧 Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration (strict mode)
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `.eslintrc.cjs` - ESLint rules

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, edit `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to any available port
}
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Run type check to see detailed errors
npm run type-check
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the project repository.

---

**Built with ❤️ using React, TypeScript, and Material-UI**
