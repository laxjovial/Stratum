# Stratum Frontend: The Command Center 🖥️

The Stratum Frontend is a high-performance **Next.js** application designed to provide a "God's Eye View" of an organization. It prioritizes clarity, visual feedback, and interactive management.

---

## 🎨 Design Philosophy: Rich Aesthetics & Power

Stratum follows a **Premium Dark/Light Glassmorphism** aesthetic. We use:
- **Rich Gradients**: To differentiate between hierarchy levels.
- **Micro-Animations**: (Framer Motion) to provide feedback on "Superior" actions.
- **Status Indicators**: Real-time authorization badges (e.g., "Authorized", "Priority View").

---

## 🗺️ Key Feature: The Organizational Web

The heart of the frontend is the **Live Neural Canvas**. It offers two modes of management:

### 1. The List View (`MemberNetwork.tsx`)
A high-density dashboard for seeing your direct and indirect subordinates. 
- **Reach Counter**: Shows how many levels deep your influence goes.
- **Audit Tool**: Triggers a visual "Security Scan" animation that simulates the backend hierarchy check.

### 2. The Visual Canvas (`OrgChart.tsx`)
Built with **ReactFlow**, this mode allows for spatial organization.
- **Neural Linking**: Visualize the reporting lines as animated edges.
- **Live Reconfiguration**: Drag-and-drop nodes to reassign managers. This sends a `PATCH` request to the backend, instantly updating the entire organization's permission tree.

---

## 🔐 The Onboarding Portal

The frontend handles the "Stratum Key" flow securely:
1. **Invite View**: Admins use a dedicated modal to pre-configure a user's role.
2. **Key Validation**: A specialized landing page captures the cryptographic token from the URL.
3. **Identity Binding**: The frontend ensures the user's email matches the invite before allowing the password setup phase.

---

## 🤖 AI Interaction: The Robotic Butler

The chat interface (`chat-window.tsx`) is the portal to your RAG intelligence.
- **Streaming Responses**: Real-time token streaming for a natural feel.
- **Context Awareness**: The AI knows where you sit in the hierarchy. It won't answer questions about the CEO's personal files if you are a Junior Staff member.

---

## 🚀 Getting Started

1. **Setup**: `npm install`
2. **Environment**: Create a `.env.local` with `NEXT_PUBLIC_API_URL`.
3. **Run**: `npm run dev`

*The Stratum Frontend turns complex organizational data into an intuitive, interactive experience.*