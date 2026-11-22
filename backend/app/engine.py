from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from app.store import store

class RentalEngine:
    """
    Deep Module encapsulating multi-entity transactional logic and business rules
    for vehicle rental bookings, return processing, and cancellation.
    """
    def __init__(self, store_instance=store):
        self.store = store_instance

    def _generate_next_rental_id(self) -> str:
        rentals = self.store.get_all("rentals")
        existing_ids = []
        for r in rentals:
            rid = r.get("id", "")
            if rid.startswith("RENT-"):
                try:
                    num = int(rid.split("-")[1])
                    existing_ids.append(num)
                except ValueError:
                    pass
        next_num = max(existing_ids, default=0) + 1
        return f"RENT-{next_num:03d}"

    def create_rental(self, customer_id: str, vehicle_id: str, duration_days: int) -> Dict[str, Any]:
        """
        Creates a new rental transaction binding Customer, Vehicle, and Rental.
        Validates customer eligibility, vehicle availability, calculates total cost,
        and atomically updates the vehicle status to Rented.
        """
        # 1. Fetch & Validate Customer
        customer = self.store.get_by_id("customers", customer_id)
        if not customer:
            raise ValueError(f"Customer with ID '{customer_id}' does not exist.")

        if customer.get("status") == "Blacklisted":
            raise ValueError(
                f"Customer '{customer.get('name')}' ({customer_id}) is Blacklisted "
                "due to previous violations and is not permitted to rent vehicles."
            )

        if not customer.get("license_number") or not customer.get("license_number", "").strip():
            raise ValueError(f"Customer '{customer_id}' does not have a valid driving license (SIM) registered.")

        # 2. Fetch & Validate Vehicle
        vehicle = self.store.get_by_id("vehicles", vehicle_id)
        if not vehicle:
            raise ValueError(f"Vehicle with ID '{vehicle_id}' does not exist.")

        curr_veh_status = vehicle.get("status")
        if curr_veh_status != "Available":
            raise ValueError(
                f"Vehicle '{vehicle.get('model_name')}' ({vehicle_id}) is not Available for rental "
                f"(Current status: '{curr_veh_status}')."
            )

        # 3. Compute Financial Breakdown
        daily_rate = int(vehicle.get("daily_rate", 0))
        total_cost = daily_rate * duration_days

        # 4. Generate Timestamps
        now = datetime.now(timezone.utc)
        rented_at = now.isoformat()
        expected_return_at = (now + timedelta(days=duration_days)).isoformat()
        new_id = self._generate_next_rental_id()

        rental_record = {
            "id": new_id,
            "customer_id": customer_id,
            "vehicle_id": vehicle_id,
            "duration_days": duration_days,
            "daily_rate_snapshot": daily_rate,
            "total_cost": total_cost,
            "rental_status": "Ongoing",
            "rented_at": rented_at,
            "expected_return_at": expected_return_at,
            "returned_at": None,
            "created_at": rented_at
        }

        # 5. Atomic State Mutations
        # Update vehicle status to Rented
        self.store.update("vehicles", vehicle_id, {"status": "Rented"})
        # Insert rental record
        created_rental = self.store.insert("rentals", rental_record)

        return created_rental

    def return_rental(self, rental_id: str) -> Dict[str, Any]:
        """
        Processes vehicle return: marks Rental as Completed, timestamps returned_at,
        and atomically restores the Vehicle status to Available.
        """
        rental = self.store.get_by_id("rentals", rental_id)
        if not rental:
            raise ValueError(f"Rental with ID '{rental_id}' does not exist.")

        if rental.get("rental_status") != "Ongoing":
            raise ValueError(
                f"Rental '{rental_id}' is already closed (Current status: '{rental.get('rental_status')}')."
            )

        now = datetime.now(timezone.utc).isoformat()
        vehicle_id = rental.get("vehicle_id")

        # Update vehicle status to Available
        if vehicle_id:
            self.store.update("vehicles", vehicle_id, {"status": "Available"})

        # Update rental status
        updated_rental = self.store.update("rentals", rental_id, {
            "rental_status": "Completed",
            "returned_at": now
        })
        return updated_rental

    def cancel_rental(self, rental_id: str) -> Dict[str, Any]:
        """
        Aborts an ongoing rental: marks Rental as Canceled and restores the Vehicle
        status to Available immediately.
        """
        rental = self.store.get_by_id("rentals", rental_id)
        if not rental:
            raise ValueError(f"Rental with ID '{rental_id}' does not exist.")

        if rental.get("rental_status") != "Ongoing":
            raise ValueError(
                f"Rental '{rental_id}' cannot be canceled (Current status: '{rental.get('rental_status')}')."
            )

        now = datetime.now(timezone.utc).isoformat()
        vehicle_id = rental.get("vehicle_id")

        if vehicle_id:
            self.store.update("vehicles", vehicle_id, {"status": "Available"})

        updated_rental = self.store.update("rentals", rental_id, {
            "rental_status": "Canceled",
            "returned_at": now
        })
        return updated_rental

# Global engine singleton
rental_engine = RentalEngine(store)
