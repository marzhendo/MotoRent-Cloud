from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.store import store
from app.engine import rental_engine
from app.schemas import RentalCreate, RentalResponse

router = APIRouter(prefix="/api/rentals", tags=["Rentals"])

@router.get("", response_model=List[RentalResponse])
def get_rentals(
    status: Optional[str] = Query(None, description="Filter by status: Ongoing, Completed, Canceled"),
    customer_id: Optional[str] = Query(None, description="Filter by Customer ID"),
    vehicle_id: Optional[str] = Query(None, description="Filter by Vehicle ID")
):
    rentals = store.get_all("rentals")
    if status:
        rentals = [r for r in rentals if r.get("rental_status") == status]
    if customer_id:
        rentals = [r for r in rentals if r.get("customer_id") == customer_id]
    if vehicle_id:
        rentals = [r for r in rentals if r.get("vehicle_id") == vehicle_id]
    # Return sorted by newest created_at
    rentals.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return rentals

@router.get("/{rental_id}", response_model=RentalResponse)
def get_rental(rental_id: str):
    rental = store.get_by_id("rentals", rental_id)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rental transaction with ID '{rental_id}' not found."
        )
    return rental

@router.post("", response_model=RentalResponse, status_code=status.HTTP_201_CREATED)
def create_rental(payload: RentalCreate):
    try:
        created = rental_engine.create_rental(
            customer_id=payload.customer_id,
            vehicle_id=payload.vehicle_id,
            duration_days=payload.duration_days
        )
        return created
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{rental_id}/return", response_model=RentalResponse)
def return_rental(rental_id: str):
    try:
        updated = rental_engine.return_rental(rental_id)
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{rental_id}/cancel", response_model=RentalResponse)
def cancel_rental(rental_id: str):
    try:
        updated = rental_engine.cancel_rental(rental_id)
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
