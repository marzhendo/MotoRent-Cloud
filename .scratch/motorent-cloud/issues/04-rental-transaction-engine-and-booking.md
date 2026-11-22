# 04: Rental Transaction Engine & Booking Workflow

**What to build:** The core multi-entity transactional workflow that validates customer eligibility and vehicle availability, calculates total costs automatically based on duration and daily tariff, records the rental, and transitions the vehicle to rented status atomically.

**Blocked by:** 02: Customer Entity Full CRUD, 03: Vehicle Fleet Catalog & Full CRUD

**Status:** ready-for-agent

- [ ] Pydantic schemas implemented for `RentalCreate` and `RentalResponse` with formatted ID (`RENT-xxx`).
- [ ] `RentalEngine` module implemented encapsulating multi-entity transaction logic and validation rules.
- [ ] Transaction creation strictly rejects blacklisted customers or customers missing driving licenses (HTTP 400).
- [ ] Transaction creation strictly rejects vehicles that are not in `Available` status (HTTP 400).
- [ ] Rental automatically computes `total_cost = duration_days * vehicle.daily_rate` and records rate snapshots.
- [ ] Vehicle status is atomically updated from `Available` to `Rented` upon rental confirmation.
- [ ] REST API endpoints `/api/rentals` (List & Create) implemented.
- [ ] Pytest suite verifying happy path booking and all boundary failure conditions.
- [ ] React frontend Booking Dialog allowing customers or staff to pick an available vehicle, select an active customer, choose duration, view calculated cost breakdown, and submit rental.
