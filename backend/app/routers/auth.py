from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Header
from app.store import store
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.auth_utils import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def _generate_next_id(collection: str, prefix: str) -> str:
    items = store.get_all(collection)
    existing_ids = []
    for item in items:
        item_id = item.get("id", "")
        if item_id.startswith(f"{prefix}-"):
            try:
                num = int(item_id.split("-")[1])
                existing_ids.append(num)
            except ValueError:
                pass
    next_num = max(existing_ids, default=0) + 1
    return f"{prefix}-{next_num:03d}"

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Dependency to resolve the authenticated user from the Authorization: Bearer <token> header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired or is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = store.get_by_id("users", payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    with store._lock:
        # 1. Check if email is already taken
        all_users = store.get_all("users")
        clean_email = payload.email.strip().lower()
        if any(u.get("email", "").strip().lower() == clean_email for u in all_users):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{clean_email}' is already registered."
            )
        
        # 2. Check if phone already registered in customers
        all_customers = store.get_all("customers")
        clean_phone = payload.phone.strip()
        if any(c.get("phone", "").strip() == clean_phone for c in all_customers):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phone number '{clean_phone}' is already registered to a customer profile."
            )

        # 3. Create Customer profile record
        cust_id = _generate_next_id("customers", "CUST")
        customer_record = {
            "id": cust_id,
            "name": payload.name.strip(),
            "phone": clean_phone,
            "license_number": payload.license_number.strip(),
            "status": "Active"
        }
        store.insert("customers", customer_record)

        # 4. Create User credential record
        user_id = _generate_next_id("users", "USER")
        pw_hash = hash_password(payload.password)
        user_record = {
            "id": user_id,
            "email": clean_email,
            "password_hash": pw_hash,
            "name": payload.name.strip(),
            "role": "customer",
            "customer_id": cust_id
        }
        created_user = store.insert("users", user_record)

        # 5. Issue Token
        token = create_access_token({
            "sub": user_id,
            "email": clean_email,
            "role": "customer",
            "customer_id": cust_id
        })

        user_response = UserResponse(
            id=created_user["id"],
            email=created_user["email"],
            name=created_user["name"],
            role=created_user["role"],
            customer_id=created_user["customer_id"],
            created_at=created_user["created_at"]
        )

        return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    all_users = store.get_all("users")
    clean_email = payload.email.strip().lower()
    
    matched_user = None
    for u in all_users:
        if u.get("email", "").strip().lower() == clean_email:
            matched_user = u
            break
            
    if not matched_user or not verify_password(payload.password, matched_user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = create_access_token({
        "sub": matched_user["id"],
        "email": matched_user["email"],
        "role": matched_user["role"],
        "customer_id": matched_user.get("customer_id")
    })
    
    user_response = UserResponse(
        id=matched_user["id"],
        email=matched_user["email"],
        name=matched_user["name"],
        role=matched_user["role"],
        customer_id=matched_user.get("customer_id"),
        created_at=matched_user["created_at"]
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        customer_id=current_user.get("customer_id"),
        created_at=current_user["created_at"]
    )
