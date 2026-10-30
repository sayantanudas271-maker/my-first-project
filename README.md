# AutoOps AI - Autonomous Enterprise Workflow Agent
### Autonomous Supply Chain & Vendor Operations Orchestrator

AutoOps AI is an enterprise-grade agentic workflow automation platform designed to solve fragmented supply chain operations, manual RFQ vendor negotiations, and slow approval bottlenecks. 

By coordinating a mesh of autonomous specialized domain agents (Inventory Monitor, Vendor Negotiator, Compliance Guard, Approval Router, and EDI Dispatcher), the platform executes multi-step procurement missions while enforcing policy thresholds through Human-in-the-Loop (HITL) managerial sign-offs.

---

## 1. Multi-Agent Architecture

```
                                  [ User Goal / Telemetry Trigger ]
                                                  │
                                                  ▼
                                      ┌────────────────────────┐
                                      │   Orchestrator Agent   │
                                      │   (LLM Task Planner)   │
                                      └───────────┬────────────┘
                                                  │ Synthesizes DAG
                                                  ▼
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │ Inventory Monitor    │──>│ Vendor Negotiator    │──>│ Compliance Guard     │
 │ Tool: check_stock    │   │ Tool: query_rates    │   │ Tool: eval_compliance│
 └──────────────────────┘   └──────────────────────┘   └──────────┬───────────┘
                                                                  │
                                                                  ▼
 ┌──────────────────────┐              [ Dynamic Policy Check ]   │
 │ EDI Dispatcher Agent │<─────────────────┼─── [ Risk > 60 OR Spend > $5k ]
 │ Tool: draft_po_edi   │  Auto-Approved   │          │
 └──────────────────────┘                  │          ▼
                                           │   ┌──────────────────────┐
                                           └───│   HITL Manager Gate  │
                                               │ (Sign-Off Required)  │
                                               └──────────────────────┘
```

### Specialized Domain Agents:
1. **Orchestrator Agent**: Breaks high-level business directives into a Directed Acyclic Graph (DAG) with dependency ordering and initial risk scoring.
2. **Inventory Monitor Agent**: Scans warehouse stock levels, computes burn rates, safety stock deficits, and optimal reorder batch sizes (`check_stock`).
3. **Vendor Negotiator Agent**: Solicits real-time RFQ quotes from verified supplier catalogs, analyzes volume tier discounts, and executes competitive bidding (`query_vendor_rates`).
4. **Compliance Agent**: Enforces ISO-9001, RoHS, ITAR, and ESG standards, checking supplier SLA reliability and sanctions (`evaluate_compliance`).
5. **Approval Router Agent (HITL Gate)**: Calculates dynamic risk index (1-100). Enforces corporate policy: if total spend exceeds **$5,000 USD** or risk exceeds **60/100**, the workflow pauses and alerts the Procurement Manager for digital sign-off.
6. **EDI Dispatcher Agent**: Formulates standardized purchase orders (`PO-XXXX`), transmits electronic EDI/SMTP confirmations, and reconciles ERP stock allocations (`draft_po`, `send_email_notification`).

---

## 2. Advanced Features Added

### A. Three.js 3D Autonomous Warehouse Digital Twin (`/digital-twin`)
- Built using Three.js with strict procedural craft and studio PBR lighting (`ACESFilmicToneMapping`, `RoomEnvironment` with `PMREMGenerator`, warm directional key + cool `HemisphereLight` fill, horizon fog).
- **Composite 3–12 Part Procedural Models**:
  - Autonomous Mobile Robots (AGVs) with chassis, drive wheels, rotating LiDAR turret with cyan emission, cargo payload, and radial contact shadows.
  - High-Bay industrial storage racks with upright columns, cross-braces, multi-tiered orange shelf levels, and SKU crates.
  - Articulated 8-part robotic picking cell with turntable, boom arm, elbow joint, and pneumatic gripper.
- **Viewport-First Collapsible Control Dock**:
  - Camera views: Depot Orbit, AGV Track, Robotic Cell, High-Bay Racks.
  - Exploded view vertical shelf separation slider.
  - AGV patrol speed multiplier (0.5x, 1x, 2x).

### B. Firebase Authentication & Firestore Persistence
- **Firebase Auth**: Supports secure **Google Sign-In with popup** (`signInWithPopup`), creating authenticated user profiles.
- **Firestore Database**: Intermediate schema in `firebase-blueprint.json` and hardened security rules in `firestore.rules` implementing the Eight Pillars of Zero-Trust security.
- Connection verification via `getDocFromServer(doc(db, 'test', 'connection'))`.

### C. Live Market Intelligence via Google Search Grounding
- Grounded supply chain intelligence powered by `gemini-3.8-flash` with the `googleSearch` tool.
- Real-time search for global semiconductor bottlenecks, raw material price indices (titanium, copper, rare-earths), tariff updates, and vendor ratings.
- Returns grounded summaries, citations, and source URLs.

### D. Multi-Turn Gemini Agentic Copilot Chatbot
- Multi-turn conversation thread with scrollable history and context preservation.
- Three specialized personas:
  - ⚡ **Fast Dispatcher** (`gemini-3.1-flash-lite`): Rapid inventory lookups and dispatch tracking.
  - 🧠 **Operations Strategist** (`gemini-3.8-flash`): Strategic RFQ negotiations and volume tier optimization.
  - 🔬 **Complex Architect & Risk Auditor** (`gemini-4-argon` / high reasoning): Geopolitical tariff analysis and dynamic risk governance.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Three.js (`three`), Lucide Icons, Recharts, React Router v6.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Zod schemas, `@google/genai` SDK (`gemini-3.8-flash`, `gemini-3.1-flash-lite`).
- **Database & Auth**: Firebase Auth (Google Sign-In), Cloud Firestore, plus In-Memory repository fallback with pre-seeded data.

---

## 4. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Application Port
PORT=3000

# JSON Web Token Secret for Authentication
JWT_SECRET="autoops-enterprise-jwt-secret-2026"

# Google Gemini API Key for Agent Planning, Grounded Search, and Chat
GEMINI_API_KEY="your-gemini-api-key-here"

# Database Connection URL (for MongoDB Atlas or Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/autoops"

# Client URL
CLIENT_URL="http://localhost:3000"
```

---

## 5. Pre-Seeded Demo Accounts & Role-Based Access Control

Quickly switch between pre-seeded roles or log in with Google:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Sarah Chen | `admin@autoops.ai` | `AdminPass123!` | Full system governance, override authority |
| **MANAGER** | Marcus Vance | `manager@autoops.ai` | `ManagerPass123!` | Human-in-the-Loop (HITL) sign-off for &gt; $5,000 POs |
| **AGENT_OPERATOR** | Elena Rostova | `operator@autoops.ai` | `OperatorPass123!` | Triggers autonomous tasks and monitors telemetry |
| **GOOGLE USER** | Google Sign-In | Any Google Account | OAuth Popup | Authenticated operator/manager profile via Firebase |

---

## 6. Local Setup & Production Deployment

```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
