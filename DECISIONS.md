# DECISIONS & ARCHITECTURAL LOG: Aabhushan AI

## Date: 2026-11-04 (Phase 0)

### 1. Monorepo Organization
- **Tooling**: `pnpm` workspaces managing:
  - `apps/web`: Next.js 14 App Router, Tailwind CSS, Framer Motion, Lucide React.
  - `apps/api`: FastAPI, Pydantic V2, SQLAlchemy 2 (asyncio), SQLite (dev) / PostgreSQL 16 (docker prod).
  - `apps/worker`: Celery CPU worker queue.
  - `packages/shared`: Shared TypeScript types and Zod schemas.
- **Decision**: Enabled SQLite + aiosqlite for zero-dependency local verification while maintaining full PostgreSQL 16 schema compatibility for Docker Compose.

### 2. Gemini API SDK & Image Model Verification
- Verified Google GenAI SDK (`google-genai` v2.34.0) with model parameter constraints:
  - `GEMINI_IMAGE_MODEL`: `gemini-3.1-flash-image-preview` / `gemini-2.5-flash-image`
  - `GEMINI_TEXT_MODEL`: `gemini-2.5-flash` / `gemini-3.8-flash`
  - Supported parameters confirmed: `response_modalities` (`["TEXT", "IMAGE"]`), uppercase image resolutions (`"2K"`, `"4K"`), aspect ratio hints, multi-part contents up to 14 reference images.
  - Rate limiting & fallback: Abstract `AIProvider` created with both `GeminiProvider` and `MockProvider` so the application runs completely independently of external API quotas.

### 3. Glassmorphic Design System & Accessibility
- **Tokens**: Created CSS variables for standard glass panel, accent gold, and ruby warnings with `backdrop-filter: blur(22px) saturate(160%)`, 1px translucent borders, and inner top highlights.
- **Fallbacks**: Handled `@supports not (backdrop-filter: ...)` with solid semi-opaque fallback backgrounds (`rgba(18, 17, 34, 0.95)`).
- **Contrast**: Guaranteed minimum 4.5:1 contrast against dynamic ruby/gold/indigo radial gradients.
- **Living Component Library**: Implemented at `/design` rendering interactive skin tone pickers (6-step Indian scale), face shape selectors, camera angle cards, buttons, badges, and notification toasts.

### 4. Database Seed Matrix
- Pre-seeded 69 cultural and catalogue attributes across 10 categories:
  - 6 Indian skin tones (Very Fair to Deep Brown)
  - 5 Face shapes (Oval, Round, Square, Heart, Long)
  - 4 Age groups (Early 20s, Late 20s, 30s, 40s+)
  - 8 Cultural regions (North Indian, South Indian, Maharashtrian, Rajasthani, Bengali, Gujarati, Kashmiri, North Eastern)
  - 12 Indian festive & bridal outfits (Banarasi silk, Kanjivaram, Zardozi bridal lehenga, Chanderi, Paithani, etc.)
  - 8 Occasions (Grand Wedding, Sangeet, Reception, Diwali, etc.)
  - 8 Backgrounds (Warm taupe studio, Udaipur heritage palace, Temple courtyard, etc.)
  - 8 Poses
  - 6 Hairstyles (Royal bridal bun with gajra, textured waves, etc.)
  - 4 Makeup looks

