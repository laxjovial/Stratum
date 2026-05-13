# Stratum Backend: The Hierarchical Engine ⚙️

The Stratum backend is the central authority for organization logic, security, and data orchestration. It is designed to be the "Engine of Truth" for complex organizational structures.

---

## 🔑 Core Pillar: Superior Priority Control

The defining feature of Stratum is **Recursive Hierarchy Enforcement**. Unlike traditional RBAC which is flat, Stratum understands depth:

1.  **Ownership Chains**: Every asset (Document, Lesson, User) belongs to a hierarchy. 
2.  **Priority View**: A superior can "look down" the reporting line. If you manage the Marketing Head, you automatically inherit the right to see the Marketing Department's strategic documents.
3.  **Subordinate Isolation**: Subordinates cannot "look up" or "sideways" without explicit authorization. This prevents data leaks between departments (e.g., Sales shouldn't see Engineering's codebase).

### Implementation:
We use a **Recursive CTE (Common Table Expression)** style approach in Python to fetch the "Network" of any user. When a request comes in for a document, the backend checks:
- Is the requester the owner?
- Is the owner in the requester's subordinate tree?
- Does the requester have an "Override" role (like CEO)?

---

## 🛡️ Identity & Onboarding: The "Stratum Key"

To maintain strict organizational integrity, the backend handles onboarding as a **Secure Handshake**:

- **Pre-Registration**: Admins create a "Seat" in the organization via `POST /users/invite`.
- **Assignment**: The seat is bound to a `UUID` for a Role and a `UUID` for a Department.
- **The Key**: A cryptographic token is generated.
- **The Claim**: When a user signs up, the backend validates their email against the invited "Seat" and the Token. If valid, the user record is updated from `PENDING` to `ACTIVE`.

---

## 💾 Infrastructure: Provider-Agnosticism

The backend is built to survive in any environment. It uses a **Strategy Pattern** for its core services:

### 1. Storage Strategy (`src/core/storage.py`)
- **Primary**: AWS S3 (Production scale).
- **Secondary**: Supabase Storage (Rapid development/Low cost).

### 2. Vector Strategy (`src/services/rag_pipeline`)
- **Primary**: Pinecone (High-speed enterprise search).
- **Secondary**: Supabase pgvector (Internal localized search).

---

## 📡 API Architecture

### `/users`
Manages the **Organizational Web**. It provides the data for the live org chart and handles the recursion logic for subordinates.

### `/departments`
Handles the creation and nesting of organizational units. Every department can have a `head_id`, which automatically grants that user superior priority over everyone in that unit.

### `/lessons`
The Content Engine. This allows managers to push training documents down the chain. A "Lesson" created at the CEO level can be globally visible, while a Lesson created in "QA" stays within "Engineering."

---

## 🧪 Development Workflow

1. **Virtual Env**: `python -m venv venv && source venv/bin/activate`
2. **Install**: `pip install -r requirements.txt`
3. **Run**: `uvicorn src.main:app --reload --port 8000`

*The Stratum Backend ensures that power is not just assigned, but enforced.*
