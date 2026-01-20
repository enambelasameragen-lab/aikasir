from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from openai import OpenAI
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'aikasir_db')]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'aikasir-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OpenAI Client
openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="AIKasir API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

# Tenant Models
class TenantConfig(BaseModel):
    business_type: str = "general"
    features: Dict[str, bool] = {"stock": False, "booking": False}
    payment_methods: List[str] = ["tunai"]

class Tenant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subdomain: str
    address: Optional[str] = None
    phone: Optional[str] = None
    config: TenantConfig = Field(default_factory=TenantConfig)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    email: str
    password: str
    role: str = "pemilik"  # pemilik, kasir
    is_active: bool = True
    status: str = "active"  # active, invited, disabled
    invited_by: Optional[str] = None
    invite_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    email: str
    role: str
    status: str = "active"

class UserInvite(BaseModel):
    name: str
    email: str
    role: str = "kasir"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class AcceptInvite(BaseModel):
    token: str
    password: str

# Item Models
class Item(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    price: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemCreate(BaseModel):
    name: str
    price: int

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None

# Transaction Models
class TransactionItem(BaseModel):
    item_id: str
    name: str
    qty: int
    price: int
    subtotal: int

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    transaction_number: str
    items: List[TransactionItem]
    total: int
    discount_amount: int = 0
    final_total: int = 0
    payment_method: str = "tunai"  # tunai, qris, transfer
    payment_amount: int
    change_amount: int
    payment_reference: Optional[str] = None  # Untuk QRIS/Transfer reference
    status: str = "selesai"  # selesai, void
    voided_at: Optional[str] = None
    voided_by: Optional[str] = None
    void_reason: Optional[str] = None
    created_by: str
    created_by_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    items: List[Dict[str, Any]]  # [{"item_id": "...", "qty": 2}]
    payment_method: str = "tunai"
    payment_amount: int
    payment_reference: Optional[str] = None

class TransactionVoid(BaseModel):
    reason: str

# AI Onboarding Models
class AIOnboardMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class AISession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step: int = 0
    business_type: Optional[str] = None
    business_name: Optional[str] = None
    items: List[str] = []
    owner_email: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str, tenant_id: str) -> str:
    payload = {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_invite_token() -> str:
    """Generate unique invite token"""
    return str(uuid.uuid4())

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token sudah expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Tidak ada token")
    
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    return user

def require_owner(current_user: dict):
    """Check if user is owner/pemilik"""
    if current_user.get("role") != "pemilik":
        raise HTTPException(status_code=403, detail="Hanya pemilik yang bisa melakukan ini")
    return current_user

def generate_subdomain(name: str) -> str:
    """Generate subdomain from business name"""
    import re
    subdomain = name.lower()
    subdomain = re.sub(r'[^a-z0-9]', '', subdomain)
    return subdomain[:20] if len(subdomain) > 20 else subdomain

def format_rupiah(amount: int) -> str:
    """Format number to Rupiah string"""
    return f"Rp {amount:,}".replace(",", ".")

async def generate_transaction_number(tenant_id: str) -> str:
    """Generate transaction number for today"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    count = await db.transactions.count_documents({
        "tenant_id": tenant_id,
        "transaction_number": {"$regex": f"^{today}"}
    })
    return f"{today}{str(count + 1).zfill(4)}"

# ============== AI ONBOARDING ==============

AI_SYSTEM_PROMPT = """Kamu adalah asisten AIKasir yang membantu UMKM setup toko mereka.
Kamu harus bertanya dalam bahasa Indonesia yang santai dan ramah.

Tugas kamu:
1. Tanya jenis usaha/bisnis apa (contoh: warung kopi, toko baju, barbershop)
2. Tanya nama toko/usaha
3. Tanya barang/layanan apa saja yang dijual (minta sebutkan beberapa)
4. Tanya email untuk login

Jawab dalam JSON format:
{
  "message": "pesan untuk user",
  "step": 1-4,
  "data": {
    "business_type": "...",
    "business_name": "...",
    "items": ["item1", "item2"],
    "email": "..."
  },
  "complete": true/false
}

Jika complete=true, berarti semua data sudah lengkap.
Pastikan items adalah array minimal 2 item."""

@api_router.post("/v1/ai/onboard")
async def ai_onboard(data: AIOnboardMessage):
    """AI-powered onboarding untuk setup toko baru"""
    try:
        # Get or create session
        session = None
        if data.session_id:
            session_doc = await db.ai_sessions.find_one({"id": data.session_id}, {"_id": 0})
            if session_doc:
                session = AISession(**session_doc)
        
        if not session:
            session = AISession()
            await db.ai_sessions.insert_one(session.model_dump())
        
        # Build conversation history
        messages = [
            {"role": "system", "content": AI_SYSTEM_PROMPT}
        ]
        
        # Get previous messages for this session
        prev_messages = await db.ai_messages.find(
            {"session_id": session.id}
        ).sort("created_at", 1).to_list(100)
        
        for msg in prev_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": data.message})
        
        # Save user message
        await db.ai_messages.insert_one({
            "session_id": session.id,
            "role": "user",
            "content": data.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Call OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        ai_response = response.choices[0].message.content
        ai_data = json.loads(ai_response)
        
        # Save AI response
        await db.ai_messages.insert_one({
            "session_id": session.id,
            "role": "assistant",
            "content": ai_response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Update session with extracted data
        update_data = {}
        if ai_data.get("data"):
            if ai_data["data"].get("business_type"):
                update_data["business_type"] = ai_data["data"]["business_type"]
            if ai_data["data"].get("business_name"):
                update_data["business_name"] = ai_data["data"]["business_name"]
            if ai_data["data"].get("items"):
                update_data["items"] = ai_data["data"]["items"]
            if ai_data["data"].get("email"):
                update_data["owner_email"] = ai_data["data"]["email"]
        
        if ai_data.get("step"):
            update_data["step"] = ai_data["step"]
        
        if update_data:
            await db.ai_sessions.update_one(
                {"id": session.id},
                {"$set": update_data}
            )
        
        # If complete, create tenant, user, and items
        if ai_data.get("complete") and ai_data.get("data"):
            extracted = ai_data["data"]
            
            # Check if email already exists
            existing_user = await db.users.find_one({"email": extracted.get("email", "")})
            if existing_user:
                return {
                    "status": "continue",
                    "message": "Email sudah terdaftar. Coba pakai email lain ya!",
                    "session_id": session.id
                }
            
            # Create tenant
            subdomain = generate_subdomain(extracted.get("business_name", "toko"))
            tenant = Tenant(
                name=extracted.get("business_name", "Toko Saya"),
                subdomain=subdomain,
                config=TenantConfig(business_type=extracted.get("business_type", "general"))
            )
            tenant_dict = tenant.model_dump()
            tenant_dict["created_at"] = tenant_dict["created_at"].isoformat()
            tenant_dict["config"] = dict(tenant_dict["config"])
            await db.tenants.insert_one(tenant_dict)
            
            # Create user with temporary password
            temp_password = str(uuid.uuid4())[:8]
            user = User(
                tenant_id=tenant.id,
                name="Pemilik",
                email=extracted.get("email", f"{subdomain}@aikasir.com"),
                password=hash_password(temp_password),
                role="pemilik"
            )
            user_dict = user.model_dump()
            user_dict["created_at"] = user_dict["created_at"].isoformat()
            await db.users.insert_one(user_dict)
            
            # Create items
            created_items = []
            items_list = extracted.get("items", [])
            for item_name in items_list:
                item = Item(
                    tenant_id=tenant.id,
                    name=item_name,
                    price=10000  # Default price, user can edit later
                )
                item_dict = item.model_dump()
                item_dict["created_at"] = item_dict["created_at"].isoformat()
                await db.items.insert_one(item_dict)
                created_items.append({"name": item_name, "price": 10000})
            
            # Create token for auto-login
            token = create_token(user.id, tenant.id)
            
            return {
                "status": "complete",
                "message": ai_data.get("message", "Toko kamu sudah jadi! 🎉"),
                "session_id": session.id,
                "tenant": {
                    "id": tenant.id,
                    "name": tenant.name,
                    "subdomain": tenant.subdomain
                },
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "temp_password": temp_password
                },
                "items": created_items,
                "token": token
            }
        
        return {
            "status": "continue",
            "message": ai_data.get("message", "Oke, lanjut ya!"),
            "session_id": session.id
        }
        
    except Exception as e:
        logger.error(f"AI Onboard error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ============== AUTH ROUTES ==============

@api_router.post("/v1/auth/login")
async def login(data: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Email tidak ditemukan")
    
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Password salah")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Akun tidak aktif")
    
    # Get tenant
    tenant = await db.tenants.find_one({"id": user["tenant_id"]}, {"_id": 0})
    
    token = create_token(user["id"], user["tenant_id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        },
        "tenant": {
            "id": tenant["id"] if tenant else None,
            "name": tenant["name"] if tenant else None,
            "subdomain": tenant["subdomain"] if tenant else None,
            "address": tenant.get("address"),
            "phone": tenant.get("phone")
        }
    }

@api_router.get("/v1/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    return {
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"]
        },
        "tenant": tenant
    }

@api_router.put("/v1/auth/password")
async def change_password(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Change password"""
    new_password = data.get("new_password")
    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
    
    hashed = hash_password(new_password)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password": hashed}}
    )
    return {"message": "Password berhasil diubah"}

# ============== ITEMS ROUTES ==============

@api_router.get("/v1/items")
async def get_items(
    active_only: bool = True,
    search: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all items for current tenant"""
    query = {"tenant_id": current_user["tenant_id"]}
    if active_only:
        query["is_active"] = True
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    items = await db.items.find(query, {"_id": 0}).sort("name", 1).to_list(1000)
    return {"items": items, "total": len(items)}

@api_router.post("/v1/items", status_code=201)
async def create_item(
    data: ItemCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new item"""
    if not data.name:
        raise HTTPException(status_code=400, detail="Nama barang harus diisi")
    if data.price <= 0:
        raise HTTPException(status_code=400, detail="Harga harus lebih dari 0")
    
    item = Item(
        tenant_id=current_user["tenant_id"],
        name=data.name,
        price=data.price
    )
    item_dict = item.model_dump()
    item_dict["created_at"] = item_dict["created_at"].isoformat()
    await db.items.insert_one(item_dict)
    
    # Remove MongoDB _id before returning
    item_dict.pop("_id", None)
    
    return item_dict

@api_router.put("/v1/items/{item_id}")
async def update_item(
    item_id: str,
    data: ItemUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update item"""
    item = await db.items.find_one({
        "id": item_id,
        "tenant_id": current_user["tenant_id"]
    })
    if not item:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
    
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.price is not None:
        if data.price <= 0:
            raise HTTPException(status_code=400, detail="Harga harus lebih dari 0")
        update_data["price"] = data.price
    
    if update_data:
        await db.items.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.items.find_one({"id": item_id}, {"_id": 0})
    return updated_item

@api_router.delete("/v1/items/{item_id}")
async def delete_item(
    item_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete item (soft delete)"""
    item = await db.items.find_one({
        "id": item_id,
        "tenant_id": current_user["tenant_id"]
    })
    if not item:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
    
    await db.items.update_one({"id": item_id}, {"$set": {"is_active": False}})
    return {"message": "Barang berhasil dihapus"}

# ============== TRANSACTIONS ROUTES ==============

@api_router.get("/v1/transactions")
async def get_transactions(
    date: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get transactions for current tenant"""
    query = {"tenant_id": current_user["tenant_id"]}
    
    if date:
        # Filter by date (YYYY-MM-DD)
        query["transaction_number"] = {"$regex": f"^{date.replace('-', '')}"}
    
    total = await db.transactions.count_documents(query)
    transactions = await db.transactions.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(offset)\
        .limit(limit)\
        .to_list(limit)
    
    return {"transactions": transactions, "total": total}

@api_router.get("/v1/transactions/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single transaction detail"""
    transaction = await db.transactions.find_one({
        "id": transaction_id,
        "tenant_id": current_user["tenant_id"]
    }, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    
    # Get tenant info for receipt
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    
    return {
        "transaction": transaction,
        "receipt": {
            "business_name": tenant["name"] if tenant else "Toko",
            "address": tenant.get("address", "") if tenant else "",
            "phone": tenant.get("phone", "") if tenant else ""
        }
    }

@api_router.post("/v1/transactions", status_code=201)
async def create_transaction(
    data: TransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new transaction"""
    if not data.items:
        raise HTTPException(status_code=400, detail="Keranjang tidak boleh kosong")
    
    # Build transaction items
    transaction_items = []
    total = 0
    
    for cart_item in data.items:
        item = await db.items.find_one({
            "id": cart_item["item_id"],
            "tenant_id": current_user["tenant_id"]
        }, {"_id": 0})
        
        if not item:
            raise HTTPException(status_code=400, detail=f"Barang tidak ditemukan")
        
        qty = cart_item.get("qty", 1)
        subtotal = item["price"] * qty
        
        transaction_items.append(TransactionItem(
            item_id=item["id"],
            name=item["name"],
            qty=qty,
            price=item["price"],
            subtotal=subtotal
        ))
        total += subtotal
    
    # Validate payment method
    valid_methods = ["tunai", "qris", "transfer"]
    if data.payment_method not in valid_methods:
        raise HTTPException(status_code=400, detail="Metode pembayaran tidak valid")
    
    # Validate payment - only for tunai need to check amount
    if data.payment_method == "tunai":
        if data.payment_amount < total:
            raise HTTPException(status_code=400, detail="Pembayaran kurang dari total")
        change_amount = data.payment_amount - total
    else:
        # For QRIS/Transfer, payment amount should be exact
        change_amount = 0
        if data.payment_amount < total:
            data.payment_amount = total  # Auto-set to total for non-cash
    
    # Generate transaction number
    transaction_number = await generate_transaction_number(current_user["tenant_id"])
    
    # Create transaction
    transaction = Transaction(
        tenant_id=current_user["tenant_id"],
        transaction_number=transaction_number,
        items=[item.model_dump() for item in transaction_items],
        total=total,
        final_total=total,
        payment_method=data.payment_method,
        payment_amount=data.payment_amount,
        change_amount=change_amount,
        payment_reference=data.payment_reference,
        created_by=current_user["id"],
        created_by_name=current_user["name"]
    )
    
    transaction_dict = transaction.model_dump()
    transaction_dict["created_at"] = transaction_dict["created_at"].isoformat()
    await db.transactions.insert_one(transaction_dict)
    
    # Remove MongoDB _id before returning
    transaction_dict.pop("_id", None)
    
    # Get tenant for receipt
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    
    return {
        **transaction_dict,
        "receipt": {
            "business_name": tenant["name"] if tenant else "Toko",
            "address": tenant.get("address", "") if tenant else "",
            "phone": tenant.get("phone", "") if tenant else ""
        }
    }

@api_router.post("/v1/transactions/{transaction_id}/void")
async def void_transaction(
    transaction_id: str,
    data: TransactionVoid,
    current_user: dict = Depends(get_current_user)
):
    """Void/cancel a transaction (owner only)"""
    require_owner(current_user)
    
    # Find transaction
    transaction = await db.transactions.find_one({
        "id": transaction_id,
        "tenant_id": current_user["tenant_id"]
    })
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    
    if transaction.get("status") == "void":
        raise HTTPException(status_code=400, detail="Transaksi sudah dibatalkan")
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": "void",
                "voided_at": datetime.now(timezone.utc).isoformat(),
                "voided_by": current_user["id"],
                "void_reason": data.reason
            }
        }
    )
    
    return {
        "message": "Transaksi berhasil dibatalkan",
        "transaction_id": transaction_id,
        "voided_by": current_user["name"],
        "reason": data.reason
    }

# ============== REPORTS ROUTES ==============

@api_router.get("/v1/reports/summary")
async def get_report_summary(
    start_date: str = None,
    end_date: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get sales summary report for date range"""
    require_owner(current_user)
    
    # Default to today if no dates provided
    if not start_date:
        start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if not end_date:
        end_date = start_date
    
    # Convert dates to transaction number prefix format
    start_prefix = start_date.replace("-", "")
    end_prefix = end_date.replace("-", "")
    
    # Build query
    query = {
        "tenant_id": current_user["tenant_id"],
        "status": "selesai"
    }
    
    # Get all transactions in range
    transactions = await db.transactions.find(query, {"_id": 0}).to_list(10000)
    
    # Filter by date range
    filtered_transactions = []
    for t in transactions:
        tx_date = t["transaction_number"][:8]
        if start_prefix <= tx_date <= end_prefix:
            filtered_transactions.append(t)
    
    # Calculate summary
    total_sales = sum(t["total"] for t in filtered_transactions)
    total_transactions = len(filtered_transactions)
    
    # Payment method breakdown
    payment_breakdown = {}
    for t in filtered_transactions:
        method = t.get("payment_method", "tunai")
        if method not in payment_breakdown:
            payment_breakdown[method] = {"count": 0, "amount": 0}
        payment_breakdown[method]["count"] += 1
        payment_breakdown[method]["amount"] += t["total"]
    
    # Items breakdown
    items_summary = {}
    total_items_sold = 0
    for t in filtered_transactions:
        for item in t["items"]:
            name = item["name"]
            qty = item["qty"]
            if name not in items_summary:
                items_summary[name] = {"qty": 0, "revenue": 0}
            items_summary[name]["qty"] += qty
            items_summary[name]["revenue"] += item["subtotal"]
            total_items_sold += qty
    
    # Sort items by revenue
    top_items = sorted(
        [{"name": k, **v} for k, v in items_summary.items()],
        key=lambda x: x["revenue"],
        reverse=True
    )[:10]
    
    # Daily breakdown (for charts)
    daily_sales = {}
    for t in filtered_transactions:
        tx_date = t["transaction_number"][:8]
        formatted_date = f"{tx_date[:4]}-{tx_date[4:6]}-{tx_date[6:8]}"
        if formatted_date not in daily_sales:
            daily_sales[formatted_date] = {"transactions": 0, "amount": 0}
        daily_sales[formatted_date]["transactions"] += 1
        daily_sales[formatted_date]["amount"] += t["total"]
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_sales": total_sales,
            "total_sales_formatted": format_rupiah(total_sales),
            "total_transactions": total_transactions,
            "total_items_sold": total_items_sold,
            "avg_transaction": total_sales // total_transactions if total_transactions > 0 else 0
        },
        "payment_breakdown": payment_breakdown,
        "top_items": top_items,
        "daily_sales": daily_sales
    }

@api_router.get("/v1/reports/daily")
async def get_daily_report(
    date: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed daily report"""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    date_prefix = date.replace("-", "")
    
    # Get transactions for the day
    transactions = await db.transactions.find({
        "tenant_id": current_user["tenant_id"],
        "transaction_number": {"$regex": f"^{date_prefix}"}
    }, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Separate by status
    completed = [t for t in transactions if t.get("status") == "selesai"]
    voided = [t for t in transactions if t.get("status") == "void"]
    
    total_sales = sum(t["total"] for t in completed)
    total_voided = sum(t["total"] for t in voided)
    
    return {
        "date": date,
        "summary": {
            "total_sales": total_sales,
            "total_sales_formatted": format_rupiah(total_sales),
            "total_transactions": len(completed),
            "total_voided": len(voided),
            "voided_amount": total_voided
        },
        "transactions": transactions
    }

@api_router.get("/v1/reports/export")
async def export_report(
    start_date: str = None,
    end_date: str = None,
    format: str = "json",
    current_user: dict = Depends(get_current_user)
):
    """Export report data"""
    require_owner(current_user)
    
    if not start_date:
        start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if not end_date:
        end_date = start_date
    
    start_prefix = start_date.replace("-", "")
    end_prefix = end_date.replace("-", "")
    
    # Get all transactions in range
    transactions = await db.transactions.find({
        "tenant_id": current_user["tenant_id"]
    }, {"_id": 0}).to_list(10000)
    
    # Filter by date range
    filtered_transactions = []
    for t in transactions:
        tx_date = t["transaction_number"][:8]
        if start_prefix <= tx_date <= end_prefix:
            # Flatten for export
            filtered_transactions.append({
                "transaction_number": t["transaction_number"],
                "date": t.get("created_at", "")[:10] if t.get("created_at") else "",
                "time": t.get("created_at", "")[11:19] if t.get("created_at") else "",
                "items": ", ".join([f"{item['name']} x{item['qty']}" for item in t["items"]]),
                "total": t["total"],
                "payment_method": t.get("payment_method", "tunai"),
                "status": t.get("status", "selesai"),
                "cashier": t.get("created_by_name", "")
            })
    
    if format == "csv":
        # Generate CSV
        import csv
        import io
        
        output = io.StringIO()
        if filtered_transactions:
            writer = csv.DictWriter(output, fieldnames=filtered_transactions[0].keys())
            writer.writeheader()
            writer.writerows(filtered_transactions)
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"laporan_{start_date}_to_{end_date}.csv"
        }
    
    return {
        "format": "json",
        "period": {"start_date": start_date, "end_date": end_date},
        "total_records": len(filtered_transactions),
        "data": filtered_transactions
    }

# ============== DASHBOARD ROUTES ==============

@api_router.get("/v1/dashboard/today")
async def get_dashboard_today(current_user: dict = Depends(get_current_user)):
    """Get today's dashboard summary"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    
    # Get today's transactions
    transactions = await db.transactions.find({
        "tenant_id": current_user["tenant_id"],
        "transaction_number": {"$regex": f"^{today}"},
        "status": "selesai"
    }, {"_id": 0}).to_list(1000)
    
    total_sales = sum(t["total"] for t in transactions)
    total_transactions = len(transactions)
    
    # Calculate items sold and top items
    items_count = {}
    items_revenue = {}
    total_items_sold = 0
    
    for t in transactions:
        for item in t["items"]:
            name = item["name"]
            qty = item["qty"]
            items_count[name] = items_count.get(name, 0) + qty
            items_revenue[name] = items_revenue.get(name, 0) + item["subtotal"]
            total_items_sold += qty
    
    # Sort by quantity to get top items
    top_items = sorted(
        [{"name": k, "qty": v, "revenue": items_revenue[k]} for k, v in items_count.items()],
        key=lambda x: x["qty"],
        reverse=True
    )[:5]
    
    return {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "total_sales": total_sales,
        "total_sales_formatted": format_rupiah(total_sales),
        "total_transactions": total_transactions,
        "total_items_sold": total_items_sold,
        "top_items": top_items
    }

# ============== SETTINGS ROUTES ==============

@api_router.get("/v1/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get tenant settings"""
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Toko tidak ditemukan")
    return tenant

@api_router.put("/v1/settings")
async def update_settings(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update tenant settings"""
    if current_user["role"] != "pemilik":
        raise HTTPException(status_code=403, detail="Hanya pemilik yang bisa ubah pengaturan")
    
    update_data = {}
    if "name" in data:
        update_data["name"] = data["name"]
    if "address" in data:
        update_data["address"] = data["address"]
    if "phone" in data:
        update_data["phone"] = data["phone"]
    
    if update_data:
        await db.tenants.update_one(
            {"id": current_user["tenant_id"]},
            {"$set": update_data}
        )
    
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    return tenant

# ============== USER MANAGEMENT ROUTES ==============

@api_router.get("/v1/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Get all users for current tenant (owner only)"""
    require_owner(current_user)
    
    users = await db.users.find(
        {"tenant_id": current_user["tenant_id"]},
        {"_id": 0, "password": 0, "invite_token": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"users": users, "total": len(users)}

@api_router.post("/v1/users/invite", status_code=201)
async def invite_user(
    data: UserInvite,
    current_user: dict = Depends(get_current_user)
):
    """Invite new user (kasir) to tenant"""
    require_owner(current_user)
    
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    # Create invite token
    invite_token = create_invite_token()
    
    # Create user with invited status
    user = User(
        tenant_id=current_user["tenant_id"],
        name=data.name,
        email=data.email,
        password="",  # Will be set when accepting invite
        role=data.role if data.role in ["kasir", "pemilik"] else "kasir",
        status="invited",
        invited_by=current_user["id"],
        invite_token=invite_token
    )
    
    user_dict = user.model_dump()
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    await db.users.insert_one(user_dict)
    user_dict.pop("_id", None)
    
    # Get tenant for invite link
    tenant = await db.tenants.find_one({"id": current_user["tenant_id"]}, {"_id": 0})
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status
        },
        "invite_token": invite_token,
        "invite_link": f"/invite/{invite_token}",
        "message": f"Undangan berhasil dikirim ke {data.email}"
    }

@api_router.post("/v1/users/accept-invite")
async def accept_invite(data: AcceptInvite):
    """Accept invitation and set password"""
    # Find user by invite token
    user = await db.users.find_one({"invite_token": data.token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Link undangan tidak valid")
    
    if user.get("status") != "invited":
        raise HTTPException(status_code=400, detail="Undangan sudah digunakan")
    
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
    
    # Update user with password and active status
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "password": hash_password(data.password),
                "status": "active",
                "invite_token": None,
                "is_active": True
            }
        }
    )
    
    # Create token for auto-login
    token = create_token(user["id"], user["tenant_id"])
    
    # Get tenant
    tenant = await db.tenants.find_one({"id": user["tenant_id"]}, {"_id": 0})
    
    return {
        "message": "Selamat datang! Akun kamu sudah aktif",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        },
        "tenant": {
            "id": tenant["id"] if tenant else None,
            "name": tenant["name"] if tenant else None,
            "subdomain": tenant.get("subdomain") if tenant else None
        }
    }

@api_router.get("/v1/users/invite/{token}")
async def get_invite_info(token: str):
    """Get invitation info for accept invite page"""
    user = await db.users.find_one({"invite_token": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Link undangan tidak valid")
    
    if user.get("status") != "invited":
        raise HTTPException(status_code=400, detail="Undangan sudah digunakan")
    
    # Get tenant info
    tenant = await db.tenants.find_one({"id": user["tenant_id"]}, {"_id": 0})
    
    # Get inviter info
    inviter = await db.users.find_one({"id": user.get("invited_by")}, {"_id": 0})
    
    return {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "tenant_name": tenant["name"] if tenant else "Toko",
        "invited_by": inviter["name"] if inviter else "Pemilik"
    }

@api_router.put("/v1/users/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user (owner only)"""
    require_owner(current_user)
    
    # Can't edit yourself through this endpoint
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Gunakan halaman profil untuk edit akun sendiri")
    
    user = await db.users.find_one({
        "id": user_id,
        "tenant_id": current_user["tenant_id"]
    })
    if not user:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
    
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.role is not None and data.role in ["kasir", "pemilik"]:
        update_data["role"] = data.role
    if data.is_active is not None:
        update_data["is_active"] = data.is_active
        update_data["status"] = "active" if data.is_active else "disabled"
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "invite_token": 0})
    return updated_user

@api_router.delete("/v1/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete/disable user (owner only)"""
    require_owner(current_user)
    
    # Can't delete yourself
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Tidak bisa hapus akun sendiri")
    
    user = await db.users.find_one({
        "id": user_id,
        "tenant_id": current_user["tenant_id"]
    })
    if not user:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
    
    # Soft delete - disable user
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": False, "status": "disabled"}}
    )
    
    return {"message": "Karyawan berhasil dihapus"}

# ============== TENANT/SUBDOMAIN ROUTES ==============

@api_router.get("/v1/tenant/check/{subdomain}")
async def check_subdomain(subdomain: str):
    """Check if subdomain exists and get tenant info"""
    tenant = await db.tenants.find_one({"subdomain": subdomain.lower()}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Toko tidak ditemukan")
    
    return {
        "exists": True,
        "tenant": {
            "id": tenant["id"],
            "name": tenant["name"],
            "subdomain": tenant["subdomain"]
        }
    }

@api_router.get("/v1/tenant/by-subdomain/{subdomain}")
async def get_tenant_by_subdomain(subdomain: str):
    """Get full tenant info by subdomain (for public pages)"""
    tenant = await db.tenants.find_one({"subdomain": subdomain.lower()}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Toko tidak ditemukan")
    
    return {
        "id": tenant["id"],
        "name": tenant["name"],
        "subdomain": tenant["subdomain"],
        "address": tenant.get("address"),
        "phone": tenant.get("phone")
    }

# ============== LEGACY/BASIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "AIKasir API v1.0", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
