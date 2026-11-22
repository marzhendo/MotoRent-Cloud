from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.store import store
from app.schemas import VehicleCreate, VehicleUpdate, VehicleResponse

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

def generate_next_vehicle_id() -> str:
    vehicles = store.get_all("vehicles")
    existing_ids = []
    for v in vehicles:
        vid = v.get("id", "")
        if vid.startswith("VEH-"):
            try:
                num = int(vid.split("-")[1])
                existing_ids.append(num)
            except ValueError:
                pass
    next_num = max(existing_ids, default=0) + 1
    return f"VEH-{next_num:03d}"

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    category: Optional[str] = Query(None, description="Filter by category: Motor or Mobil"),
    status: Optional[str] = Query(None, description="Filter by status: Available, Rented, Maintenance"),
    search: Optional[str] = Query(None, description="Search by model name or plate number")
):
    vehicles = store.get_all("vehicles")
    if category:
        vehicles = [v for v in vehicles if v.get("category") == category]
    if status:
        vehicles = [v for v in vehicles if v.get("status") == status]
    if search:
        s = search.lower()
        vehicles = [
            v for v in vehicles
            if s in v.get("model_name", "").lower()
            or s in v.get("plate_number", "").lower()
        ]
    return vehicles

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str):
    vehicle = store.get_by_id("vehicles", vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID '{vehicle_id}' not found."
        )
    return vehicle

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate):
    new_id = generate_next_vehicle_id()
    item_dict = payload.model_dump()
    item_dict["id"] = new_id
    created = store.insert("vehicles", item_dict)
    return created

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: str, payload: VehicleUpdate):
    existing = store.get_by_id("vehicles", vehicle_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID '{vehicle_id}' not found."
        )
    
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = store.update("vehicles", vehicle_id, update_data)
    return updated

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    existing = store.get_by_id("vehicles", vehicle_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID '{vehicle_id}' not found."
        )

    # Deletion guard: Check if vehicle is rented or has an ongoing rental
    if existing.get("status") == "Rented":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete vehicle '{vehicle_id}' because its status is currently Rented."
        )

    rentals = store.get_all("rentals")
    for r in rentals:
        if r.get("vehicle_id") == vehicle_id and r.get("rental_status") == "Ongoing":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete vehicle '{vehicle_id}' because it is bound to an ongoing rental ({r.get('id')})."
            )

    store.delete("vehicles", vehicle_id)
    return {"message": f"Vehicle '{vehicle_id}' deleted successfully.", "id": vehicle_id}
