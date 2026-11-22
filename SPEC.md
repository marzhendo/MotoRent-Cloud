# Specification: MotoRent Cloud

## Problem Statement

Traditional local vehicle rental businesses (motorcycles and cars) rely heavily on manual paper notebooks, separate chat applications, and ad-hoc spreadsheets to manage their fleet, track customers, and record daily rental bookings. This manual process causes frequent scheduling clashes (double-booking), calculation mistakes in daily tariffs, lack of visibility into which vehicles are available, rented, or undergoing maintenance, and administrative overhead. 

For the course CAK3EAB3 Komputasi Awan dan Terdistribusi at Telkom University Purwokerto, students are tasked with building and deploying a cloud-based web application solving this problem. A strict constraint is imposed: **no external database (RDBMS/NoSQL) may be used**, requiring all data persistence to be handled using structured JSON/dictionary collections in memory. Furthermore, the system must demonstrate decoupled client-server architecture, CRUD operations across at least three entities, multi-entity transactional business logic, and readiness for AWS cloud deployment (including horizontal scalability and load balancer demonstrations).

## Solution

MotoRent Cloud is a modern, responsive, decoupled web application composed of a **FastAPI (Python)** REST API backend and a **React + Vite + Tailwind CSS + shadcn UI** frontend, deployed to Amazon Web Services (AWS).

The application provides:
1. **Full CRUD Management for 3 Core Entities:**
   - `Customer`: Profiling renters with validation of driving license numbers (SIM) and active/blacklisted status flags.
   - `Vehicle`: Cataloging motorcycle and car units with category classification (`Motor` vs `Mobil`), plate numbers, daily rental tariffs, and real-time operational status (`Available`, `Rented`, `Maintenance`).
   - `Rental`: Tracking complete lease transactions (`Ongoing`, `Completed`, `Canceled`) linking customers and vehicles for defined durations.
2. **Multi-Entity Transactional Engine:**
   - **Automated Rental Checkout (3 Entities):** Verifies that the customer is `Active` and vehicle is `Available`, computes `total_cost = daily_rate × duration_days`, creates a `Rental` record, and transitions the `Vehicle` status to `Rented` atomically.
   - **Return & Release Workflow (2 Entities):** Completes the `Rental` transaction, records return timestamps, and immediately restores the `Vehicle` status to `Available`.
   - **Customer Rental History (2 Entities):** Aggregates and displays all historical and ongoing rentals tied to a specific customer profile.
3. **Hybrid File-Backed In-Memory Persistence:**
   - Operates entirely via fast in-memory Python dictionaries with thread-safe write locks, synchronized with a local `backend/data/store.json` file. Preloaded with realistic Indonesian seed data (5 vehicles and 3 customers).
4. **Cloud Load Balancing & Scalability Telemetry:**
   - Includes `X-Instance-Id` response headers and an `/api/info` endpoint returning server instance metadata, allowing students to demonstrate live Round-Robin and Least Connection load balancing across multiple EC2 instances behind an AWS Application Load Balancer.

---

## User Stories

### Customer Management Stories
1. As a rental staff member, I want to create a new customer record with full name, active phone number, and driving license (SIM) number, so that the business has verified contact and legal driving records for renters.
2. As a rental staff member, I want to view a list of all registered customers with search and filtering by status, so that I can quickly look up customer records during counter service.
3. As a rental staff member, I want to see detailed information for a specific customer including their lifetime rental count, so that I understand their rental history.
4. As a rental staff member, I want to update a customer's phone number or driving license number, so that contact and credential details remain up to date.
5. As a rental staff member, I want to toggle a customer's status between `Active` and `Blacklisted`, so that individuals with outstanding debts, vehicle damage violations, or missing SIM cards can be barred from new rentals.
6. As a rental staff member, I want to delete a customer record that has no active ongoing rentals, so that obsolete or test records can be purged safely.
7. As a rental staff member, I want the system to reject deleting a customer who currently has an ongoing rental, so that active financial and vehicle possession records are not orphaned.

### Vehicle Fleet Management Stories
8. As a rental staff member, I want to add a new vehicle unit specifying model name, vehicle category (`Motor` or `Mobil`), license plate number, daily rental rate in IDR, and initial status, so that our fleet catalog expands.
9. As a rental staff member, I want to view all vehicles in the fleet catalog with indicators for daily rate, category, and operational status, so that I have complete fleet visibility.
10. As a rental staff member, I want to filter the vehicle list by category (`Semua`, `Motor`, `Mobil`) and by availability (`Available`, `Rented`, `Maintenance`), so that I can promptly answer customer inquiries.
11. As a rental staff member, I want to update vehicle details (daily rate, model name, plate number), so that catalog changes reflect real-world vehicle updates.
12. As a rental staff member, I want to change a vehicle's status to `Maintenance`, so that units requiring service or repair cannot be accidentally rented out.
13. As a rental staff member, I want to delete a retired vehicle from the catalog if it is not currently rented out, so that decommissioned units do not clutter the inventory.
14. As a customer browsing the public catalog, I want to see all currently available vehicles with pictures/placeholders, specs, and daily rates, so that I can decide which motor or car suits my travel needs.

### Rental & Transactional Business Logic Stories
15. As a rental staff member, I want to create a rental transaction by selecting an active customer and an available vehicle with a rental duration in days, so that the customer can rent the vehicle immediately.
16. As a system operator, I want the rental creation process to automatically compute `total_cost = duration_days * daily_rate`, so that manual calculation errors are eliminated.
17. As a system operator, I want the system to strictly reject rental creation if the customer is `Blacklisted` with an informative error message, so that business risk is mitigated.
18. As a system operator, I want the system to strictly reject rental creation if the selected vehicle is already `Rented` or in `Maintenance`, so that double-booking is prevented.
19. As a rental staff member, I want the vehicle's status to immediately switch from `Available` to `Rented` upon rental confirmation, so that the fleet catalog reflects real-time availability.
20. As a rental staff member, I want to view all rental transactions sorted by date, with filters for `Ongoing`, `Completed`, and `Canceled` statuses.
21. As a rental staff member, I want to process a vehicle return by clicking a single return action, which marks the rental as `Completed`, records the return timestamp, and automatically resets the vehicle status to `Available`.
22. As a rental staff member, I want to cancel an erroneous rental before departure, marking the rental as `Canceled` and releasing the vehicle back to `Available`.
23. As a rental staff member, I want to view a customer's full rental history on their profile, showing both active and completed rentals with total spend.

### Cloud Architecture & Telemetry Stories
24. As an instructor or student evaluator, I want to inspect the `/api/info` endpoint and the `X-Instance-Id` HTTP response header, so that I can verify which AWS EC2 backend instance processed each request behind the Application Load Balancer.
25. As an instructor evaluating scalability, I want to send consecutive HTTP requests and observe rotating instance IDs, so that I have concrete proof that the Round-Robin / Least Connection algorithm is functioning as described in the assignment.
26. As a developer deploying to AWS, I want frontend assets to be decoupled static files servable via AWS S3 / CloudFront, so that the frontend achieves high availability and minimal hosting costs.

---

## Implementation Decisions

### Architectural Seams & Modules
1. **Primary Seam (HTTP API Boundary):**
   - The entire backend exposes a RESTful JSON HTTP interface under `/api/`.
   - Callers (React frontend or automated tests) interact exclusively through this seam.
2. **Deep Modules:**
   - **`RentalEngine` Module:** Exposes a minimal interface:
     - `create_rental(customer_id, vehicle_id, duration_days)`
     - `return_vehicle(rental_id)`
     - `cancel_rental(rental_id)`
     Behind this small interface, `RentalEngine` encapsulates validation of customer status, vehicle availability, atomic state mutation, and cost calculation.
   - **`JsonStore` Module:** Exposes a clean interface:
     - `get_all(collection)`, `get_by_id(collection, id)`, `insert(collection, item)`, `update(collection, id, data)`, `delete(collection, id)`.
     Behind this interface, `JsonStore` encapsulates thread-safety locks, in-memory dictionary indexing, and serialization to `backend/data/store.json`.

### Schemas & Entity Specifications
1. **`Customer` Entity:**
   - `id`: String (e.g. `CUST-001`)
   - `name`: String
   - `phone`: String
   - `license_number`: String (SIM A / SIM C)
   - `status`: String enum (`Active` | `Blacklisted`)
   - `created_at`: ISO 8601 DateTime string
2. **`Vehicle` Entity:**
   - `id`: String (e.g. `VEH-001`)
   - `model_name`: String (e.g. "Yamaha NMAX 155", "Toyota Avanza")
   - `category`: String enum (`Motor` | `Mobil`)
   - `plate_number`: String (e.g. "R 1234 AB")
   - `daily_rate`: Integer (in IDR, e.g. 120000)
   - `status`: String enum (`Available` | `Rented` | `Maintenance`)
   - `created_at`: ISO 8601 DateTime string
3. **`Rental` Entity:**
   - `id`: String (e.g. `RENT-001`)
   - `customer_id`: String (Foreign key to `Customer.id`)
   - `vehicle_id`: String (Foreign key to `Vehicle.id`)
   - `duration_days`: Integer
   - `daily_rate_snapshot`: Integer (Rate at time of rental)
   - `total_cost`: Integer (`duration_days * daily_rate_snapshot`)
   - `rental_status`: String enum (`Ongoing` | `Completed` | `Canceled`)
   - `rented_at`: ISO 8601 DateTime string
   - `expected_return_at`: ISO 8601 DateTime string
   - `returned_at`: Optional ISO 8601 DateTime string

### API Contracts
- `GET /api/customers` - List customers (supports `?status=Active`)
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer detail
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer (rejected if active rental exists)
- `GET /api/vehicles` - List vehicles (supports `?category=Motor&status=Available`)
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/{id}` - Get vehicle detail
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle (rejected if rented)
- `GET /api/rentals` - List rentals (supports `?status=Ongoing&customer_id=CUST-001`)
- `POST /api/rentals` - Create rental (validates customer and vehicle, updates vehicle to Rented)
- `GET /api/rentals/{id}` - Get rental detail
- `POST /api/rentals/{id}/return` - Return vehicle (sets Completed, vehicle Available)
- `POST /api/rentals/{id}/cancel` - Cancel rental (sets Canceled, vehicle Available)
- `GET /api/info` - Health and telemetry (returns `instance_id`, `uptime`, `version`)

### Design System & Frontend
- Built on **React 18 + Vite** with **Tailwind CSS** and **shadcn UI** primitives.
- Global navigation switcher between "Katalog Pelanggan" and "Panel Manajemen Admin".
- Color tokens: Emerald for `Available`/`Active`, Amber for `Rented`/`Ongoing`, Rose for `Maintenance`/`Blacklisted`/`Canceled`.

---

## Testing Decisions

### Guiding Testing Principles
- Tests target the **HTTP API Seam** using `pytest` and `httpx.AsyncClient` (FastAPI TestClient), verifying real HTTP status codes, error payloads, and persisted state across requests.
- No testing of internal mock implementations; tests verify end-to-end observable outcomes.

### Modules Tested
1. **CRUD Isolation Tests:**
   - Complete CRUD cycles for `Customer`, `Vehicle`, and `Rental`.
2. **Business Rule Violation Tests:**
   - Creating a rental for a `Blacklisted` customer returns `400 Bad Request`.
   - Creating a rental for a `Rented` or `Maintenance` vehicle returns `400 Bad Request`.
   - Deleting a customer or vehicle tied to an `Ongoing` rental returns `400 Bad Request`.
3. **Multi-Entity Workflow Tests:**
   - Create rental -> Vehicle status updates to `Rented` in catalog.
   - Return rental -> Vehicle status updates back to `Available` in catalog.
   - Customer rental history aggregates correctly.
4. **Persistence & Telemetry Tests:**
   - Modifying data updates the in-memory store and serializes to disk.
   - `X-Instance-Id` header is returned on every API response.

---

## Out of Scope

1. **External Relational/NoSQL Database Engines:** Strictly prohibited by coursework rules (no PostgreSQL, MySQL, SQLite, MongoDB, or DynamoDB).
2. **JWT User Authentication / Password Hashing:** Intentionally omitted to provide a friction-free evaluation experience for the course instructor.
3. **Payment Gateway Integration:** Payment is treated as on-spot cash/transfer; no Midtrans or Stripe integration needed.
4. **Arbitrary Future Calendar Date Reservations:** Instant checkout model only (`duration_days` from present).

---

## Further Notes

- **Cloud Deployment Alignment:** The backend is packaged with a `Dockerfile` and setup script for AWS EC2. The frontend builds into an `npm run build` static distribution ready for AWS S3 and CloudFront distribution.
- **Course Artifact Reference:** Matches all requirements of `Tugas-9 Dasar Komputasi Awan.docx` (Question 2: CRUD, 3 entities, multi-entity transactions, wireframes, use case diagrams, and scalability illustrations).
