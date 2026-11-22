from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.store import store
from app.schemas import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter(prefix="/api/customers", tags=["Customers"])

def generate_next_customer_id() -> str:
    customers = store.get_all("customers")
    existing_ids = []
    for c in customers:
        cid = c.get("id", "")
        if cid.startswith("CUST-"):
            try:
                num = int(cid.split("-")[1])
                existing_ids.append(num)
            except ValueError:
                pass
    next_num = max(existing_ids, default=0) + 1
    return f"CUST-{next_num:03d}"

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    status: Optional[str] = Query(None, description="Filter by status: Active or Blacklisted"),
    search: Optional[str] = Query(None, description="Search by name, phone, or license number")
):
    customers = store.get_all("customers")
    if status:
        customers = [c for c in customers if c.get("status") == status]
    if search:
        s = search.lower()
        customers = [
            c for c in customers
            if s in c.get("name", "").lower()
            or s in c.get("phone", "").lower()
            or s in c.get("license_number", "").lower()
        ]
    return customers

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str):
    customer = store.get_by_id("customers", customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )
    return customer

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate):
    new_id = generate_next_customer_id()
    item_dict = payload.model_dump()
    item_dict["id"] = new_id
    created = store.insert("customers", item_dict)
    return created

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, payload: CustomerUpdate):
    existing = store.get_by_id("customers", customer_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )
    
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = store.update("customers", customer_id, update_data)
    return updated

@router.delete("/{customer_id}")
def delete_customer(customer_id: str):
    existing = store.get_by_id("customers", customer_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )

    # Deletion guard: Check if customer has an ongoing rental
    rentals = store.get_all("rentals")
    for r in rentals:
        if r.get("customer_id") == customer_id and r.get("rental_status") == "Ongoing":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete customer '{customer_id}' because they currently have an ongoing rental ({r.get('id')})."
            )

    store.delete("customers", customer_id)
    return {"message": f"Customer '{customer_id}' deleted successfully.", "id": customer_id}
