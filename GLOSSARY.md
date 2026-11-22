# MotoRent Cloud

A distributed vehicle rental web application designed for the CAK3EAB3 Komputasi Awan dan Terdistribusi course at Telkom University Purwokerto, featuring a decoupled FastAPI backend and React frontend hosted on AWS.

## Language

**Customer**:
A registered person renting vehicles with verified driving credentials (SIM).
_Avoid_: User, client, renter, account, tenant

**Vehicle**:
A motorcycle or car fleet unit with a unique plate number, daily rental rate, and vehicle category.
_Avoid_: Unit, motor, car, asset, item, product

**Rental**:
A rental lease transaction binding a Customer and a Vehicle for a defined duration in days.
_Avoid_: Booking, order, transaction, reservation, checkout

**In-Memory Store**:
The centralized JSON/dictionary data structure inside the FastAPI backend acting as the system's persistence layer without external databases, backed by local file sync.
_Avoid_: Database, table, collection, cache

**Instance Telemetry**:
Metadata in HTTP response headers (`X-Instance-Id`) and the `/api/info` endpoint indicating which AWS EC2 node served the request, used to verify Load Balancer distribution.
_Avoid_: Host info, server ping, debug dump

### Status & Attribute Vocabularies

**Customer Status**:
- `Active`: Eligible to create new rentals.
- `Blacklisted`: Prohibited from renting any vehicle due to violations or missing SIM.

**Vehicle Status**:
- `Available`: Ready and idle in the catalog for immediate rental.
- `Rented`: Currently in possession of a customer under an active rental.
- `Maintenance`: Under repair or servicing, unavailable for checkout.

**Vehicle Category**:
- `Motor`: Two-wheel motorcycle vehicles (e.g. NMAX, Vario, Beat).
- `Mobil`: Four-wheel passenger cars (e.g. Avanza, Xpander).

**Rental Status**:
- `Ongoing`: The vehicle has been checked out and is currently active.
- `Completed`: The vehicle has been returned and restored to available status.
- `Canceled`: The rental transaction was aborted before completion.
