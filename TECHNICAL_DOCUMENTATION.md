# Vibe Vault - Technical Documentation

## 1. Executive Summary

**Vibe Vault** is a comprehensive SaaS productivity platform designed specifically for "vibe coding" workflows. It enables developers and creative technologists to efficiently store, organize, retrieve, and share AI prompts, code snippets, and knowledge resources.

The platform is built as a multi-tenant web application, supporting individual developers and teams with role-based access control (RBAC), real-time collaboration, and seamless integration with modern development workflows.

---

## 2. System Architecture

Vibe Vault utilizes a modern, serverless architecture leveraging **Convex** for the backend/database and **React (Vite)** for the frontend, ensuring sub-200ms response times and real-time synchronization.

### 2.1 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 18, Vite | Component-based UI with fast HMR. |
| **Styling** | Tailwind CSS, Shadcn UI | Responsive, accessible, and consistent design system. |
| **State Mgmt** | Zustand | Lightweight client-side state management. |
| **Backend** | Convex | Serverless backend-as-a-service (BaaS) replacing traditional Node.js/Postgres. |
| **Database** | Convex (Document) | Real-time, relational-like document store. |
| **Auth** | Supabase Auth | Secure authentication (Email/Password) with JWT. |
| **Hosting** | Vercel (Frontend) | Edge network deployment for static assets. |

### 2.2 High-Level Architecture

```mermaid
graph TD
    User[User Client] -->|HTTPS| CDN[Vercel CDN]
    User -->|Auth (JWT)| Supabase[Supabase Auth]
    User -->|WebSocket/HTTPS| Convex[Convex Backend]
    
    subgraph "Convex Cloud"
        API[API Functions]
        DB[(Distributed Database)]
        Scheduler[Cron/Scheduler]
        
        API --> DB
        API --> Scheduler
    end
    
    Convex -->|Sync| User
```

---

## 3. Database Schema

The database is implemented using **Convex**, providing strong consistency and real-time updates.

### 3.1 Core Tables

#### `profiles`
Stores user profile information, linked to the authentication provider.
- `userId` (String, Index): External Auth ID (Supabase).
- `username` (String): Display name.
- `fullName` (String): Full legal/display name.
- `avatarUrl` (String): Profile picture URL.

#### `items`
The central repository for prompts, code snippets, and files.
- `userId` (String, Index): Owner ID.
- `type` (Enum): "code" | "prompt" | "file".
- `title` (String): Searchable title.
- `content` (String): The code or prompt text.
- `language` (String): Programming language (for syntax highlighting).
- `category` (String): Organizational category.
- `isFavorite` (Boolean): Quick access flag.

#### `projects`
Kanban-style project management entities.
- `teamId` (ID, Optional): For team-owned projects.
- `status` (Enum): "ideation" | "planning" | "in_progress" | "completed".
- `progress` (Number): 0-100 completion percentage.
- `priority` (Enum): "low" | "medium" | "high".

#### `teams` & `teamMembers`
Implements multi-tenancy and RBAC.
- **Teams**: `name`, `createdBy`, `isPersonal`.
- **Members**: `teamId`, `userId`, `role` (admin/member/viewer).

#### `shares`
Manages public and private sharing links.
- `boardShares`: Read-only links for Kanban boards.
- `publicShares`: Shareable links for individual projects.
- `token`: Unique access token.
- `expiresAt`: Automatic expiration timestamp.

---

## 4. API Specification & Data Flow

Vibe Vault uses **Convex Functions** (Queries and Mutations) instead of traditional REST/GraphQL endpoints. This ensures end-to-end type safety and automatic reactivity.

### 4.1 Authentication Flow
1.  **Client** calls `supabase.auth.signInWithPassword`.
2.  **Supabase** returns a JWT and Session.
3.  **Client** stores Session in `useAuthStore` (Zustand).
4.  **Client** calls `convex.query(api.profiles.getProfile)` using the authenticated `userId`.
5.  **Convex** validates the request and returns user data.

### 4.2 Core Mutations

-   `createItem(type, title, content, ...)`: atomic creation of assets.
-   `updateProjectStatus(projectId, status)`: Real-time Kanban updates.
-   `inviteTeamMember(teamId, email, role)`: Generates secure invite tokens.

### 4.3 Real-time Synchronization
All `useQuery` hooks in the frontend automatically subscribe to database changes. When a user updates a Project status:
1.  Mutation `updateProjectStatus` is called.
2.  Database updates immediately.
3.  Convex pushes the new state to *all* connected clients viewing that project (WebSocket).
4.  UI re-renders instantly (Optimistic updates supported).

---

## 5. Security & Compliance

### 5.1 Role-Based Access Control (RBAC)
Implemented at the application layer via `teamMembers` table.
-   **Admin**: Full access to Team Settings, Billing, Member Management.
-   **Member**: Can create/edit Projects and Items.
-   **Viewer**: Read-only access.

### 5.2 Data Security
-   **Encryption at Rest**: Managed by Convex infrastructure.
-   **Encryption in Transit**: TLS 1.2+ for all connections.
-   **Row Level Security (RLS)**: Convex functions explicitly check `userId` or `teamId` before returning data.

### 5.3 Privacy (GDPR/CCPA)
-   **Data Export**: Users can export all their data via JSON/CSV (Roadmap).
-   **Right to Erasure**: Cascading deletes implemented to remove all user data upon request.

---

## 6. Feature Specifications

### 6.1 "One-Click" Interactions
-   **Copy Code**: UI components utilize `navigator.clipboard` for instant copying of code blocks.
-   **Prompt Injection**: "Use Prompt" button automatically focuses the IDE extension (if installed) or copies to clipboard.

### 6.2 Advanced Search
-   **Full-Text Search**: Convex search indexing on `items.title` and `items.content`.
-   **Filtering**: Faceted search by `type`, `language`, `tags`, and `date`.

### 6.3 Collaborative Knowledge
-   **Team Library**: Shared view of `items` filtered by `teamId`.
-   **Project Boards**: Real-time collaborative Kanban boards.

---

## 7. Deployment & Operations

### 7.1 Infrastructure
-   **Frontend**: Deployed on Vercel (Automatic deployments on git push).
-   **Backend**: Managed Convex Cloud instance.

### 7.2 CI/CD Pipeline
-   **Linting**: ESLint + Prettier run on pre-commit.
-   **Testing**: Vitest for unit tests.
-   **Build**: `vite build` creates optimized production assets.

### 7.3 Monitoring
-   **Error Tracking**: Integration with Sentry (Recommended).
-   **Analytics**: Custom `accessLogs` table tracks usage patterns; integrated with PostHog (Optional).

### 7.4 Service Level Objectives (SLOs)
-   **Availability**: 99.9% Uptime (relies on Convex/Vercel SLAs).
-   **Latency**: <200ms API response time (95th percentile).

---

## 8. Implementation Guidelines for Advanced Features

### 8.1 Offline Capability
To achieve robust offline support (PWA):
1.  **Service Worker**: Implement a service worker using `vite-plugin-pwa` to cache static assets (HTML, CSS, JS).
2.  **Optimistic UI**: Leverage TanStack Query or Convex's built-in optimistic updates to allow user interactions without network.
3.  **Local Persistence**: Use `localStorage` or `IndexedDB` to queue mutations (e.g., creating a prompt) when offline, and replay them upon reconnection.

### 8.2 Browser Extension Integration
For tighter IDE/Browser integration:
1.  **Architecture**: Manifest V3 extension.
2.  **Communication**: Use `window.postMessage` to communicate between the Vibe Vault web app and the extension content script.
3.  **Auth Sharing**: Share session tokens via cookies (if on same domain) or explicit token exchange flow to allow the extension to query the API directly.

### 8.3 Data Export & Portability
1.  **Format**: JSON (machine-readable) and Markdown (human-readable) export options.
2.  **Implementation**: Create a Convex Action `exportUserData(userId)` that:
    -   Queries all tables for the user.
    -   Bundles them into a Zip file.
    -   Generates a signed download URL.

