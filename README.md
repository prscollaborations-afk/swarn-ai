# Aabhushan AI (आभूषण AI)
### Next-Gen AI Visual Studio for Indian Jewellery Shop Owners

Aabhushan AI is a SaaS platform engineered for Indian jewellery retailers. It allows shop owners to upload raw jewellery photos and generate 3 to 5 multi-angle studio catalogue photographs of authentic Indian models wearing the exact piece with verified design fidelity.

---

## Tech Stack (Monorepo)
- **Frontend (`apps/web`)**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, Zustand, Framer Motion.
- **Backend API (`apps/api`)**: FastAPI, Pydantic V2, SQLAlchemy 2 (asyncio), SQLite (development) / PostgreSQL 16 (production).
- **Worker (`apps/worker`)**: Celery CPU-based background tasks.
- **Shared (`packages/shared`)**: Shared Zod schemas, TypeScript types, and model presets.
- **AI Core**: Google Gemini API via `google-genai` SDK (`gemini-3.1-flash-image-preview` / `gemini-2.5-flash`) with multi-modal fidelity validation and local `MockProvider`.

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ & **pnpm**: v9+
- **Python**: 3.11+ (Python 3.13 tested)
- **Docker & Docker Compose** (for PostgreSQL, Redis, MinIO)

### 2. Setup Monorepo
```bash
# Install root and workspace node dependencies
pnpm install

# Build shared package
pnpm --filter @aabhushan/shared build
```

### 3. Setup Backend & Seed Database
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt greenlet

# Seed 69 cultural presets (skin tones, face shapes, outfits, regions)
PYTHONPATH=. .venv/bin/python -m app.seeds.seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend API (Port 8000)
cd apps/api
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Web App (Port 3000)
pnpm --filter @aabhushan/web dev
```

### 5. Access Endpoints
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Design System Showcase**: [http://localhost:3000/design](http://localhost:3000/design)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

# swarn-ai
# swarn-ai
# swarn-ai
