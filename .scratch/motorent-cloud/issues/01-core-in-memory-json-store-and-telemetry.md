# 01: Core In-Memory JSON Store & Telemetry Infrastructure

**What to build:** The foundational backend application and data persistence engine that allows the system to store, retrieve, and mutate vehicle rental data without an external database, while exposing server telemetry headers for cloud load balancing verification.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] FastAPI backend project initialized with asynchronous HTTP support and CORS middleware configurable via environment variables.
- [x] Thread-safe `JsonStore` module created supporting CRUD operations across collections (`customers`, `vehicles`, `rentals`).
- [x] Data automatically synchronizes to a local file (`backend/data/store.json`) upon write operations.
- [x] Default seed data provided (5 realistic vehicles and 3 customers with SIM credentials) if `store.json` does not exist.
- [x] Telemetry endpoint `/api/info` implemented returning instance identifier, uptime, and application version.
- [x] Middleware configured to inject `X-Instance-Id` header into all HTTP responses.
- [x] Pytest testing harness configured with automated tests verifying store operations and telemetry responses.
