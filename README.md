# Telco AI Solution Labs

Hands‑on labs where readers/attendees will learn how to build modular AI capabilities for Telecommunications customer‑service scenarios and compose them into AI Agents deployed in Microsoft Foundry.

The labs focus on practical components — agentic patterns, data ingestion and knowledge indexing, Model Context Protocol (MCP) servers, retrieval‑augmented generation (RAG) patterns, connectors to OSS/BSS, and a simple CSR web client, that you can combine into a production‑grade agent to help Customer Service Representatives (CSRs) resolve service and billing issues and surface cross‑sell/up‑sell opportunities.

This README explains how the outputs of the individual labs are intended to integrate into AI Agents in Microsoft Foundry and the recommended patterns, security, and deployment checklist for that integration.

## Table of contents
- Goals
- Labs (reference)
- Foundry integration overview
- How labs map to agent components
- Implementation checklist & example flow
- Security, privacy & compliance
- Testing, observability & ops
- Best practices
- Next steps & contact

### Goals
- Provide modular labs that produce reusable components (MCP servers, retrievers, connectors, client samples).
- Demonstrate how those components are composed into one or more Microsoft Foundry AI Agents that expose a secure API to CSR client applications (web SPA).
- Ensure the final system is evidence‑grounded, auditable, and conforms to telco data/privacy/regulatory constraints.

### Labs (Reference)
- Core labs are in the repo folders (lab-01, lab-02, ...). Each lab contains a README with objectives, prerequisites, code, and mock data. See:
  - lab-01/ — Telco Service Desk MCP Server
  - lab-02/ — Telco Customer360 MCP Server
  
  Refer to the lab READMEs for detailed steps on building each solution component.

### Foundry Integration — Conceptual Overview
Microsoft Foundry AI Agents provide agent orchestration, tool registration, security, and an agent API surface.
The integration pattern here is:
1. Build discrete backend capabilities (from labs) that expose reusable machine‑friendly interfaces (MCP JSON‑RPC endpoints or REST).
2. Deploy those capabilities as network‑reachable services (containers, functions, or serverless endpoints).
3. Register those services as tools/endpoints in a Foundry agent manifest so the agent can invoke them as tools (with typed inputs/outputs).
4. Use Foundry agent orchestration to:
   - Maintain conversation state,
   - Call retrieval services and MCP tools,
   - Apply business rules for cross/up‑sell,
   - Enforce guardrails and audit decisions, and
   - Return structured responses (reply + suggested actions + cited evidence) to the CSR client.

### How Labs map to AI Agent components
- Data Ingestion & Vectorization lab
  - Component: Embedding pipeline + Vector store (Azure Cognitive Search, Pinecone, Foundry Vector Store etc.)
  - Agent use: Retrieval tool for evidence grounding (RAG)
- MCP Server Labs (lab-01, lab-02, ...)
  - Component: MCP JSON‑RPC endpoints implementing tools (search_tickets, get_customer_info, etc.)
  - Agent use: Register as callable tools for account lookups, ticket creation, search tickets, troubleshoot and diagnose issues etc
- RAG & Prompt engineering lab
  - Component: Retriever + Prompt templates + LLM call wrapper
  - Agent use: Language understanding and response generation with evidence citations
- Connector labs (CRM, billing, provisioning)
  - Component: Secure adapters to OSS/BSS
  - Agent use: Execute actions (create ticket, apply credit) via explicit tool calls
- (Optional) Client SPA lab
  - Component: CSR UI that calls the Foundry agent API, shows context panels and suggested actions
  - Agent use: final consumer of agent API

### Implementation Checklist & Example flow
1. Package each lab service
   - Provide an HTTP(S) endpoint (MCP JSON‑RPC or REST) with stable schema.
   - Containerize (Dockerfile) or prepare as serverless function.
   - Add health, readiness, and metrics endpoints.
2. Deploy services (staging)
   - Option: Azure Functions, Azure Container Apps, AKS, or self‑hosted containers on standalone VM's.
3. Configure secrets & auth
   - Store API keys and model credentials in Foundry secrets manager or a centralized vault.
   - Require API keys or mutual TLS for service-to-service calls.
4. Agent manifest & tool registration (Foundry)
   - Define each service as a tool in the agent manifest with:
     - name, input schema, output schema, auth method, invocation type (sync/streaming)
   - Map tool responses to agent actions (e.g., "open_ticket" -> connector call).
5. Conversation & orchestration logic
   - Use the RAG lab component to fetch evidence before generation.
   - Chain tool calls when necessary (get_customer_info → retrieve tickets → generate suggested actions).
   - Return structured payloads: { reply, actions[], evidence[] }.
6. (Optional) Client integration
   - Client sends CSR context (customer_id, CSR id, conversation id).
   - Agent returns reply + actions; client shows suggested quick‑actions and evidence cards.

### Security, Privacy & Compliance
- PII handling
  - Redact or pseudonymize before indexing.
  - Minimize sensitive fields returned by retriever; store raw PII only in the telco backend.
- Auth & access control
  - Foundry agent API must require strong auth (OAuth2 / enterprise SSO).
  - Use least privilege for tools; store credentials in Foundry secrets.
- Auditability
  - Log every tool invocation, retrieved evidence, agent output, and CSR action (immutable audit trail).
- Safety & guardrails
  - Implement policy checks before executing destructive actions (e.g., apply credit).
  - Prefer explicit CSR confirmation for account changes.
- Regulatory considerations
  - Configure data residency and retention policies per regional telco regulations.

### Testing, Observability & OPS
- Local testing
  - Run lab services locally with mocks and test individual solution components (MCP Servers, Azure Functions)  in a dev environment.
- Automated tests
  - Unit tests for connectors; integration tests using mock OSS/BSS and vector stores.
- Monitoring
  - Instrument tools and agent with metrics: latency, error rates, RAG retrieval hit/miss, hallucination detection rate.
- Tracing & logs
  - Correlate traces across agent and tools (Conversation id).
- Rollout
  - Canary deployments and AB testing to measure CSR productivity and up‑sell conversion.

### Best Practices
- Always ensure evidence citations are included within LLM responses.
- Keep tool schemas strict and typed to avoid accidental misuse.
- Use conservative generation prompts for operational decisions; offload critical checks to deterministic logic/tooling.
- Where possible, maintain a business rules layer for eligibility and offerability — never rely on LLM alone.
- Observe and iterate: collect CSR feedback and re‑train/update retrieval indexes and prompts.

### Next Steps
- Use the individual lab READMEs (lab-01, lab-02, ...) for implementation steps and then follow the checklist above to register and compose these services into a Foundry agent.

## Maintainer
- Repository owner: ganrad
- For contributions and questions, open an issue or submit a PR.