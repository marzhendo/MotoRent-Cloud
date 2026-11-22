# 04: Rental Transaction Engine & Booking Workflow

**What to build:** The core multi-entity transactional workflow that validates customer eligibility and vehicle availability, calculates total costs automatically based on duration and daily tariff, records the rental, and transitions the vehicle to rented status atomically.

**Blocked by:** 02: Customer Entity Full CRUD, 03: Vehicle Fleet Catalog & Full CRUD

**Status:** completed

- [x] Pydantic schemas implemented for `RentalCreate` and `RentalResponse` with formatted ID (`RENT-xxx`).
- [x] `RentalEngine` module implemented encapsulating multi-entity transaction logic and validation rules.
- [x] Transaction creation strictly rejects blacklisted customers or customers missing driving licenses (HTTP 400).
- [x] Transaction creation strictly rejects vehicles that are not in `Available` status (HTTP 400).
- [x] Rental automatically computes `total_cost = duration_days * vehicle.daily_rate` and records rate snapshots.
- [x] Vehicle status is atomically updated from `Available` to `Rented` upon rental confirmation.
- [x] REST API endpoints `/api/rentals` (List & Create) implemented.
- [x] Pytest suite verifying happy path booking and all boundary failure conditions.
- [x] React frontend Booking Dialog allowing customers or staff to pick an available vehicle, select an active customer, choose duration, view calculated cost breakdown, and submit rental.
