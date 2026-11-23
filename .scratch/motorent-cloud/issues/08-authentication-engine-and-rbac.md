# 08: Authentication Engine, RBAC & Split-Screen Login/Register

**What to build:** A lightweight, secure, role-based authentication engine conforming to the "no external database" constraint, featuring Customer self-registration linked to customer profile entities, Admin privileges, JWT session tokens, and modern split-screen Login and Register interfaces with 1-Click Quick Demo logins.

**Blocked by:** 07: Brand Identity, SVG Logo & Vehicle Visual Assets

**Status:** completed

- [x] User schema and `users` collection implemented in `backend/app/store.py` with salted PBKDF2/SHA-256 password hashing.
- [x] Default seed user accounts provided for Admin (`admin@motorent.cloud` / `admin123`) and Customer (`andi@motorent.cloud` / `password123`).
- [x] Authentication router implemented in `backend/app/routers/auth.py` exposing `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.
- [x] Registration endpoint atomically creates a user account and provisions a linked `Customer` profile record with name, phone, and SIM driving license.
- [x] Pytest suite `backend/tests/test_auth.py` testing registration, login, token verification, and duplicate credentials rejection.
- [x] Frontend React Auth Context (`frontend/src/context/AuthContext.tsx`) managing authenticated user state, JWT tokens, and localStorage persistence.
- [x] Split-screen `Login.tsx` and `Register.tsx` pages styled following `antislop-ui` and `antislop-copywriting` with 1-Click Demo Login buttons for Admin and Customer.
- [x] Top Navbar updated to show authenticated user identity, role badge (`Admin` or `Customer`), logout button, and role-aware navigation.
