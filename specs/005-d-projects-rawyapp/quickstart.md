# Quickstart: Admin Dashboard

**Branch**: 005-d-projects-rawyapp

## Prerequisites

- Node.js 18+
- MongoDB instance running
- Existing NestJS backend at `src/`
- JWT authentication configured

## Setup

### 1. Create Next.js frontend

```bash
npx create-next-app@14 admin-dashboard --typescript --tailwind --app
cd admin-dashboard
npm install @tanstack/react-query axios lucide-react
```

### 2. Configure environment

Create `admin-dashboard/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run backend

```bash
npm run start:dev
# Admin endpoints available at http://localhost:3000/admin
```

### 4. Run frontend

```bash
cd admin-dashboard
npm run dev
# Dashboard available at http://localhost:3001
```

## Key Paths

```
admin-dashboard/
├── app/
│   ├── (auth)/login/page.tsx       # Login page
│   └── (dashboard)/
│       ├── page.tsx                 # Dashboard overview
│       ├── users/page.tsx           # User management
│       ├── creators/page.tsx        # Creator management
│       └── ...
├── components/
│   ├── layout/Sidebar.tsx           # Navigation
│   └── features/                    # Feature components
└── lib/api.ts                       # API client
```

## Development Workflow

1. **Backend first**: Extend admin module endpoints in `src/admin/`
2. **Write tests**: Jest tests for new endpoints before implementation
3. **Frontend**: Create React components for each page
4. **Test integration**: Verify full flow works end-to-end

## Testing

```bash
# Backend tests
npm run test -- --testPathPattern=admin

# Frontend (future)
cd admin-dashboard && npm run test
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.x | Framework |
| react | 18.x | UI library |
| @tanstack/react-query | 5.x | Server state |
| axios | 1.x | HTTP client |
| recharts | 2.x | Charts (analytics) |
| lucide-react | 0.x | Icons |
| tailwindcss | 3.x | Styling |