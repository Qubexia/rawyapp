# Admin Dashboard Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive admin dashboard that provides complete control over the existing NestJS backend. The dashboard will interface with the existing admin module (`/admin` endpoints) which already provides user management, content moderation, and platform statistics capabilities.

---

## 1. Backend Enhancement

### 1.1 Extend Existing Admin API

The current admin module (`src/admin/`) provides basic functionality. Extend it to cover all backend entities:

**Users Management (`admin/users`)**
- `GET /admin/users` - List all users (existing, extend with search/filter)
- `PATCH /admin/users/:userId` - Update user details (name, avatar, location)
- `PATCH /admin/users/:userId/deactivate` - Deactivate user (existing)
- `PATCH /admin/users/:userId/activate` - Activate user (existing)
- `PATCH /admin/users/:userId/promote` - Promote to CREATOR/ADMIN (existing)
- `DELETE /admin/users/:userId` - Delete user account (cascade: podcasts, episodes, comments, likes, follows, notifications)

**Creators Management (`admin/creators`)**
- `GET /admin/creators` - List all creators with pagination
- `GET /admin/creators/:creatorId` - Get creator profile details
- `PATCH /admin/creators/:creatorId` - Update creator profile (showName, bio, avatar)
- `DELETE /admin/creators/:creatorId` - Remove creator status (downgrade to user)

**Podcasts Management (`admin/podcasts`)**
- `GET /admin/podcasts` - List all podcasts with pagination, search, category filter
- `GET /admin/podcasts/:podcastId` - Get podcast details with episode count
- `PATCH /admin/podcasts/:podcastId` - Update podcast (title, description, category, cover)
- `DELETE /admin/podcasts/:podcastId` - Remove podcast (existing, cascade delete episodes)

**Episodes Management (`admin/episodes`)**
- `GET /admin/episodes` - List all episodes with pagination, podcast/creator filter
- `GET /admin/episodes/:episodeId` - Get episode details
- `PATCH /admin/episodes/:episodeId` - Update episode (title, description, image)
- `DELETE /admin/episodes/:episodeId` - Remove episode (existing)

**Comments Management (`admin/comments`)**
- `GET /admin/comments` - List all comments with pagination, episode/episodeId filter
- `GET /admin/comments/:commentId` - Get comment details
- `DELETE /admin/comments/:commentId` - Remove comment (existing)

**Likes Management (`admin/likes`)**
- `GET /admin/episodes/:episodeId/likes` - List users who liked an episode
- `GET /admin/users/:userId/likes` - List episodes a user has liked

**Views/Analytics (`admin/analytics`)**
- `GET /admin/analytics/overview` - Dashboard overview stats
- `GET /admin/analytics/episodes/:episodeId/views` - View count and unique viewers
- `GET /admin/analytics/podcasts/:podcastId/views` - Total views per podcast
- `GET /admin/analytics/top-episodes` - Top episodes by views/likes
- `GET /admin/analytics/top-creators` - Top creators by followers/content

**Notifications (`admin/notifications`)**
- `GET /admin/notifications` - List all notifications (system-wide)
- `POST /admin/notifications/broadcast` - Send broadcast notification to all users
- `POST /admin/notifications/broadcast-by-role` - Send to specific roles

**System (`admin/system`)**
- `GET /admin/system/health` - Backend health status
- `GET /admin/system/config` - Current configuration (non-sensitive)

### 1.2 Implementation Steps

```typescript
// New admin controller methods to add

// In admin.controller.ts - add these endpoints
@Get('creators')
@Roles(Role.ADMIN)
listCreators(@Query() query: AdminQueryDto) {
  return this.adminService.listCreators(query);
}

@Get('creators/:creatorId')
@Roles(Role.ADMIN)
getCreator(@Param('creatorId') creatorId: string) {
  return this.adminService.getCreator(creatorId);
}

@Get('podcasts')
@Roles(Role.ADMIN)
listPodcasts(@Query() query: AdminQueryDto) {
  return this.adminService.listPodcasts(query);
}

@Get('podcasts/:podcastId')
@Roles(Role.ADMIN)
getPodcast(@Param('podcastId') podcastId: string) {
  return this.adminService.getPodcast(podcastId);
}

// Add similar endpoints for episodes, comments, analytics, etc.
```

### 1.3 Add New DTOs

```typescript
// admin/dto/update-podcast.dto.ts
export class UpdatePodcastDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

// admin/dto/broadcast-notification.dto.ts
export class BroadcastNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;
}
```

---

## 2. Frontend Implementation

### 2.1 Tech Stack Recommendation

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **HTTP Client**: Axios with interceptors
- **Authentication**: Reuse existing JWT auth from mobile app

### 2.2 Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard home)
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/page.tsx
│   │   ├── creators/
│   │   ├── podcasts/
│   │   ├── episodes/
│   │   ├── comments/
│   │   ├── analytics/
│   │   └── settings/
│   └── api/
│       └── auth/
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   └── features/
│       ├── users/
│       ├── podcasts/
│       └── analytics/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   └── use-admin.ts
└── types/
    └── index.ts
```

### 2.3 Core Components

**Authentication**
- Login page with email/password
- JWT token storage in httpOnly cookies or secure localStorage
- Role-based route protection (ADMIN role required)
- Session timeout handling

**Layout**
- Collapsible sidebar with navigation
- Top header with user info, notifications, logout
- Responsive design (desktop + tablet)

**Data Tables**
- Paginated tables with sorting
- Search and filter capabilities
- Bulk actions (select multiple, bulk delete/deactivate)
- Row actions (edit, delete, view)

**Forms**
- Modal forms for create/edit operations
- Image upload with preview
- Validation feedback

**Charts/Analytics**
- Line charts for trends (views over time)
- Bar charts for comparisons (top podcasts)
- Stat cards with key metrics

### 2.4 Pages Implementation

**Dashboard Home (`/`)**
- Stats cards: Total users, creators, podcasts, episodes
- Recent activity feed
- Quick actions: Create user, broadcast notification
- Charts: User growth, content growth

**Users (`/users`)**
- Table: Name, email, role, status, followerCount, createdAt
- Filters: Role, status (active/inactive)
- Actions: View, edit, activate/deactivate, delete, promote

**User Detail (`/users/[id]`)**
- Profile info card
- Activity: Podcasts created, episodes, comments
- Edit form: Name, avatar

**Creators (`/creators`)**
- Table: Name, showName, podcastCount, followerCount
- Actions: View profile, remove creator status

**Podcasts (`/podcasts`)**
- Table: Title, creator, category, episodeCount, createdAt
- Filters: Category, creator
- Actions: View, edit, delete

**Episodes (`/episodes`)**
- Table: Title, podcast, creator, viewsCount, likesCount
- Filters: Podcast, creator
- Actions: View, edit, delete

**Comments (`/comments`)**
- Table: Text preview, episode, user, createdAt
- Actions: View full, delete

**Analytics (`/analytics`)**
- Overview tab: Platform stats, growth trends
- Episodes tab: Top episodes by views/likes
- Creators tab: Top creators by followers

**Notifications (`/notifications`)**
- Broadcast form: Title, body, target audience
- History: Past broadcasts

---

## 3. Security Considerations

### 3.1 Authentication
- Use same JWT strategy as mobile API
- Require ADMIN role for all dashboard routes
- Implement rate limiting on admin endpoints
- CSRF protection

### 3.2 Authorization
- Role-based access control (RBAC)
- Audit logging for all admin actions
- Admin actions should be logged with: adminId, action, targetId, timestamp

### 3.3 Data Protection
- Don't expose sensitive data (passwordHash, refreshToken)
- Limit log retention for audit trails
- Implement admin action confirmation (for destructive actions)

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Extend backend admin API with missing endpoints
2. Set up Next.js project with UI components
3. Implement authentication flow
4. Build basic layout (sidebar, header)

### Phase 2: Core Features (Week 2)
1. Users management page
2. Creators management page
3. Podcasts management page
4. Episodes management page

### Phase 3: Additional Features (Week 3)
1. Comments moderation
2. Analytics dashboard with charts
3. Notification broadcast system

### Phase 4: Polish (Week 4)
1. Search and filtering across all pages
2. Bulk actions implementation
3. Audit logging backend
4. Responsive design fixes
5. Performance optimization

---

## 5. API Endpoints Summary

| Feature | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Stats | GET | /admin/stats | Platform overview |
| Users | GET | /admin/users | List users (paginated) |
| Users | PATCH | /admin/users/:id | Update user |
| Users | DELETE | /admin/users/:id | Delete user |
| Users | PATCH | /admin/users/:id/activate | Activate user |
| Users | PATCH | /admin/users/:id/deactivate | Deactivate user |
| Users | PATCH | /admin/users/:id/promote | Change role |
| Creators | GET | /admin/creators | List creators |
| Creators | GET | /admin/creators/:id | Get creator |
| Podcasts | GET | /admin/podcasts | List podcasts |
| Podcasts | GET | /admin/podcasts/:id | Get podcast |
| Podcasts | PATCH | /admin/podcasts/:id | Update podcast |
| Podcasts | DELETE | /admin/podcasts/:id | Delete podcast |
| Episodes | GET | /admin/episodes | List episodes |
| Episodes | GET | /admin/episodes/:id | Get episode |
| Episodes | PATCH | /admin/episodes/:id | Update episode |
| Episodes | DELETE | /admin/episodes/:id | Delete episode |
| Comments | GET | /admin/comments | List comments |
| Comments | DELETE | /admin/comments/:id | Delete comment |
| Analytics | GET | /admin/analytics/overview | Dashboard stats |
| Analytics | GET | /admin/analytics/top-episodes | Top episodes |
| Analytics | GET | /admin/analytics/top-creators | Top creators |
| Notifications | POST | /admin/notifications/broadcast | Send broadcast |

---

## 6. Dependencies

### Backend
- No new dependencies required (extend existing admin module)

### Frontend
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "@tanstack/react-query": "5.x",
    "axios": "1.x",
    "recharts": "2.x",
    "lucide-react": "0.x",
    "clsx": "2.x",
    "tailwind-merge": "2.x"
  },
  "devDependencies": {
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@types/node": "20.x"
  }
}
```

---

## 7. Notes

- Reuse existing backend services (UsersService, PodcastsService, etc.) - no duplication
- The admin module should remain under the same JWT auth guard
- Consider adding a feature flag to enable/disable the admin dashboard in production
- Mobile app authentication can be reused with minor modifications for web
- Consider adding two-factor authentication for admin accounts