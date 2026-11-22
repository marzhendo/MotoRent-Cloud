# 02: Customer Entity Full CRUD

**What to build:** End-to-end customer management enabling staff to register new renters with driving license numbers, view and search existing customer profiles, update contact details, and toggle active/blacklisted statuses to enforce rental eligibility.

**Blocked by:** 01: Core In-Memory JSON Store & Telemetry Infrastructure

**Status:** completed

- [x] Pydantic schemas implemented for `CustomerCreate`, `CustomerUpdate`, and `CustomerResponse` with formatted ID (`CUST-xxx`).
- [x] REST API endpoints created under `/api/customers` supporting full CRUD (List with search/filter, Get by ID, Create, Update, Delete).
- [x] Validation prevents creating or updating a customer with an empty license number (SIM).
- [x] Deletion guard prevents deleting a customer who has an active ongoing rental (HTTP 400).
- [x] Pytest suite covering all customer CRUD operations and status transition edge cases.
- [x] React frontend customer management view created with customer data table, search input, status badge (`Active`/`Blacklisted`), and modal forms for adding/editing customers.
