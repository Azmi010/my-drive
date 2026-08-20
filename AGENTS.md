# AGENTS.md - MyDrive

## Project Overview

Google Drive clone tanpa document editor. Preview-only. Self-hosted homeserver.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Object Storage | MinIO (S3-compatible) |
| Auth | Custom email+password, JWT |
| Monorepo | Turborepo |

## Project Structure

```
my-drive/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities, API client
│   │   │   └── stores/         # State management (zustand)
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Authentication module
│       │   │   ├── users/      # User module
│       │   │   ├── files/      # File module
│       │   │   ├── folders/    # Folder module
│       │   │   └── storage/    # MinIO integration module
│       │   ├── common/
│       │   │   ├── guards/     # Auth guards
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── decorators/
│       │   ├── config/
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── test/
├── packages/
│   └── shared/                 # Shared types, utils
│       ├── src/
│       │   ├── types/          # TypeScript types
│       │   └── constants/      # Shared constants
│       └── package.json
├── docker-compose.yml          # Local dev services (PostgreSQL, MinIO)
├── turbo.json
├── package.json                # Root workspace config
└── AGENTS.md                   # This file
```

---

## Task Breakdown

### Phase 1: Project Setup

- [ ] **1.1** Init monorepo (Turborepo + pnpm workspaces)
- [ ] **1.2** Create Next.js app (`apps/web`)
- [ ] **1.3** Create NestJS app (`apps/api`)
- [ ] **1.4** Create shared package (`packages/shared`)
- [ ] **1.5** Setup Docker Compose (PostgreSQL)
- [ ] **1.6** Configure ESLint + Prettier global
- [ ] **1.7** Setup git hooks (husky + lint-staged)

### Phase 2: Database & ORM

- [ ] **2.1** Install Prisma di `apps/api`
- [ ] **2.2** Define schema: `User`, `File`, `Folder`
- [ ] **2.3** Run migration + generate client
- [ ] **2.4** Create Prisma service (NestJS module)
- [ ] **2.5** Seed script untuk test data

### Phase 3: Auth Module

- [ ] **3.1** Register endpoint (hash password + save)
- [ ] **3.2** Login endpoint (validate + return JWT)
- [ ] **3.3** JWT strategy (passport-jwt)
- [ ] **3.4** Auth guard (protect routes)
- [ ] **3.5** `/me` endpoint (get current user)
- [ ] **3.6** Frontend: register page
- [ ] **3.7** Frontend: login page
- [ ] **3.8** Frontend: auth store (zustand)
- [ ] **3.9** Frontend: protected route wrapper

### Phase 4: File Module (Backend)

- [ ] **4.1** Install + configure MinIO client
- [ ] **4.2** Upload endpoint (multipart → MinIO)
- [ ] **4.3** Download endpoint (stream from MinIO)
- [ ] **4.4** Generate signed URL for preview
- [ ] **4.5** Get file metadata endpoint
- [ ] **4.6** List files endpoint (filter by folder, search)
- [ ] **4.7** Delete file endpoint (soft delete)
- [ ] **4.8** Rename file endpoint
- [ ] **4.9** Move file endpoint (change parent folder)
- [ ] **4.10** Star/unstar file endpoint

### Phase 5: Folder Module (Backend)

- [ ] **5.1** Create folder endpoint
- [ ] **5.2** List folder contents endpoint
- [ ] **5.3** Get folder tree (breadcrumb)
- [ ] **5.4** Rename folder endpoint
- [ ] **5.5** Move folder endpoint
- [ ] **5.6** Delete folder endpoint (cascade soft delete)
- [ ] **5.7** Star/unstar folder endpoint

### Phase 6: File Preview (Backend)

- [ ] **6.1** Preview endpoint (generate signed URL + return)
- [ ] **6.2** Detect MIME type dari file extension
- [ ] **6.3** Text/Code preview endpoint (fetch content → return string)
- [ ] **6.4** PDF preview endpoint (signed URL)

### Phase 7: Frontend - Core UI

- [ ] **7.1** Layout: sidebar + main content area
- [ ] **7.2** Sidebar: navigation (My Drive, Starred, Trash)
- [ ] **7.3** Breadcrumb component
- [ ] **7.4** File/folder grid view
- [ ] **7.5** File/folder list view
- [ ] **7.6** Toggle grid/list button
- [ ] **7.7** Context menu (right-click: rename, move, delete, star, download)
- [ ] **7.8** Upload button + drag-drop zone
- [ ] **7.9** Upload progress indicator
- [ ] **7.10** Search bar + results page

### Phase 8: Frontend - File Operations

- [ ] **8.1** Create folder modal
- [ ] **8.2** Rename modal
- [ ] **8.3** Move file/folder modal (folder picker)
- [ ] **8.4** Delete confirmation modal
- [ ] **8.5** File preview modal/page
  - [ ] **8.5.1** Image viewer (zoom, pan)
  - [ ] **8.5.2** PDF viewer (PDF.js)
  - [ ] **8.5.3** Video player (HTML5 video)
  - [ ] **8.5.4** Audio player (HTML5 audio)
  - [ ] **8.5.5** Text/code viewer (syntax highlight)
  - [ ] **8.5.6** Markdown viewer (react-markdown)
  - [ ] **8.5.7** Unsupported file type → download prompt

### Phase 9: Frontend - Trash & Starred

- [ ] **9.1** Trash page (list deleted files/folders)
- [ ] **9.2** Restore from trash
- [ ] **9.3** Permanent delete (with confirmation)
- [ ] **9.4** Starred page (list starred items)
- [ ] **9.5** Star/unstar toggle on items

### Phase 10: Frontend - Refinements

- [ ] **10.1** Loading states (skeleton, spinner)
- [ ] **10.2** Empty states (no files, no results)
- [ ] **10.3** Error handling + toast notifications
- [ ] **10.4** Keyboard shortcuts
- [ ] **10.5** Responsive design (mobile/tablet/desktop)
- [ ] **10.6** Dark mode toggle

### Phase 11: Shared Package

- [ ] **11.1** Shared types (File, Folder, User interfaces)
- [ ] **11.2** Shared constants (mime types, file size limits)
- [ ] **11.3** Shared validation schemas (zod)

---

## Development Rules

1. **Commit style**: `feat:`, `fix:`, `chore:`, `refactor:`
2. **Branch**: `main` for production, `dev` for development, feature branches dari `dev`
3. **PR**: Required review sebelum merge ke `dev`
4. **Testing**: Unit test untuk business logic, integration test untuk API
5. **Lint**: ESLint harus pass sebelum commit

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydrive

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=mydrive

# App
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API Routes Summary

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Files
- `GET /api/files?folder_id=&search=`
- `POST /api/files/upload`
- `GET /api/files/:id`
- `GET /api/files/:id/preview`
- `GET /api/files/:id/download`
- `PATCH /api/files/:id`
- `DELETE /api/files/:id`
- `POST /api/files/:id/star`
- `POST /api/files/:id/unstar`

### Folders
- `POST /api/folders`
- `GET /api/folders/:id`
- `GET /api/folders/:id/contents`
- `GET /api/folders/:id/tree`
- `PATCH /api/folders/:id`
- `DELETE /api/folders/:id`
- `POST /api/folders/:id/star`
- `POST /api/folders/:id/unstar`

### Trash
- `GET /api/trash`
- `POST /api/trash/:id/restore`
- `DELETE /api/trash/:id`

### Starred
- `GET /api/starred`
