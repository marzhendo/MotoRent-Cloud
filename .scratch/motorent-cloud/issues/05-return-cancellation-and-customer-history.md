# 05: Return & Cancellation Lifecycle and Customer History

**What to build:** Full closing of the rental lifecycle allowing staff to process vehicle returns (which sets rental to completed and returns vehicle to available) and handle cancellations, alongside an aggregated customer rental history view.

**Blocked by:** 04: Rental Transaction Engine & Booking Workflow

**Status:** completed

- [x] REST API endpoint `POST /api/rentals/{id}/return` implemented to mark rental `Completed`, record `returned_at` timestamp, and atomically reset vehicle to `Available`.
- [x] REST API endpoint `POST /api/rentals/{id}/cancel` implemented to abort ongoing rental and return vehicle to `Available`.
- [x] REST API query filter supported to fetch rental history by `customer_id` (`GET /api/rentals?customer_id=CUST-xxx`).
- [x] Pytest suite covering return, cancellation, and customer history retrieval.
- [x] React frontend Admin Rental Management table displaying active and past rentals with direct Return and Cancel action buttons.
- [x] React frontend Customer Detail modal showing full historical rental transactions and total spending.
