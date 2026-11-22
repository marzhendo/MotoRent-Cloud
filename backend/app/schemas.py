from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

CustomerStatus = Literal["Active", "Blacklisted"]
VehicleCategory = Literal["Motor", "Mobil"]
VehicleStatus = Literal["Available", "Rented", "Maintenance"]
RentalStatus = Literal["Ongoing", "Completed", "Canceled"]

# ==================== Customer Schemas ====================

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=8, max_length=20)
    license_number: str = Field(..., min_length=3, max_length=50)
    status: CustomerStatus = "Active"

    @field_validator("license_number")
    @classmethod
    def validate_license(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("License number (SIM) cannot be empty or whitespace.")
        return clean

    @field_validator("name", "phone")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    license_number: Optional[str] = Field(None, min_length=3, max_length=50)
    status: Optional[CustomerStatus] = None

    @field_validator("license_number")
    @classmethod
    def validate_license(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("License number cannot be empty or whitespace.")
            return clean
        return v

class CustomerResponse(CustomerBase):
    id: str
    created_at: str

# ==================== Vehicle Schemas ====================

class VehicleBase(BaseModel):
    model_name: str = Field(..., min_length=2, max_length=100)
    category: VehicleCategory
    plate_number: str = Field(..., min_length=3, max_length=20)
    daily_rate: int = Field(..., gt=0)
    status: VehicleStatus = "Available"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    model_name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[VehicleCategory] = None
    plate_number: Optional[str] = Field(None, min_length=3, max_length=20)
    daily_rate: Optional[int] = Field(None, gt=0)
    status: Optional[VehicleStatus] = None

class VehicleResponse(VehicleBase):
    id: str
    created_at: str

# ==================== Rental Schemas ====================

class RentalCreate(BaseModel):
    customer_id: str
    vehicle_id: str
    duration_days: int = Field(..., gt=0, le=90)

class RentalResponse(BaseModel):
    id: str
    customer_id: str
    vehicle_id: str
    duration_days: int
    daily_rate_snapshot: int
    total_cost: int
    rental_status: RentalStatus
    rented_at: str
    expected_return_at: str
    returned_at: Optional[str] = None
    created_at: str
