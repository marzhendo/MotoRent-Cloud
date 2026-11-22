# 03: Vehicle Fleet Catalog & Full CRUD

**What to build:** Comprehensive fleet management and catalog viewing allowing staff to add and manage motorcycle and car units with daily rental rates, while allowing customers to browse available vehicles filtered by category.

**Blocked by:** 01: Core In-Memory JSON Store & Telemetry Infrastructure

**Status:** ready-for-agent

- [ ] Pydantic schemas implemented for `VehicleCreate`, `VehicleUpdate`, and `VehicleResponse` with formatted ID (`VEH-xxx`) and category (`Motor` | `Mobil`).
- [ ] REST API endpoints created under `/api/vehicles` supporting full CRUD and filtering by category and status (`Available`, `Rented`, `Maintenance`).
- [ ] Deletion guard prevents deleting a vehicle that is currently rented (HTTP 400).
- [ ] Pytest suite covering all vehicle CRUD operations, category filtering, and status updates.
- [ ] React frontend Public Vehicle Catalog view created with category tabs (All / Motor / Mobil), price badges, and availability indicators.
- [ ] React frontend Admin Fleet Management table created with actions to add, edit, change status to Maintenance, or delete vehicles.
