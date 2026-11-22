import os
import json
import threading
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

INITIAL_SEED_DATA = {
    "vehicles": [
        {
            "id": "VEH-001",
            "model_name": "Yamaha NMAX 155",
            "category": "Motor",
            "plate_number": "R 1234 AB",
            "daily_rate": 120000,
            "status": "Available",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEH-002",
            "model_name": "Honda Vario 160",
            "category": "Motor",
            "plate_number": "R 5678 CD",
            "daily_rate": 100000,
            "status": "Available",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEH-003",
            "model_name": "Honda BeAT Deluxe",
            "category": "Motor",
            "plate_number": "R 9012 EF",
            "daily_rate": 80000,
            "status": "Available",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEH-004",
            "model_name": "Toyota Avanza 1.5G",
            "category": "Mobil",
            "plate_number": "B 1122 XYZ",
            "daily_rate": 350000,
            "status": "Available",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEH-005",
            "model_name": "Mitsubishi Xpander Ultimate",
            "category": "Mobil",
            "plate_number": "B 3344 JKL",
            "daily_rate": 450000,
            "status": "Available",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ],
    "customers": [
        {
            "id": "CUST-001",
            "name": "Andi Pratama",
            "phone": "081234567801",
            "license_number": "SIM-C-010293",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-002",
            "name": "Siti Rahmawati",
            "phone": "081398765402",
            "license_number": "SIM-A-029384",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-003",
            "name": "Dimas Saputra",
            "phone": "085611223303",
            "license_number": "SIM-C-038475",
            "status": "Blacklisted",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ],
    "rentals": []
}

class JsonStore:
    """
    Thread-safe in-memory store backed by synchronized local JSON file persistence.
    Complies with the course constraint of 'no external database'.
    """
    def __init__(self, file_path: Optional[str] = None):
        if file_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(base_dir, "data", "store.json")
            
        self.file_path = file_path
        self._lock = threading.Lock()
        self._data: Dict[str, List[Dict[str, Any]]] = {}
        self._load_or_initialize()

    def _load_or_initialize(self) -> None:
        with self._lock:
            if os.path.exists(self.file_path):
                try:
                    with open(self.file_path, "r", encoding="utf-8") as f:
                        self._data = json.load(f)
                        return
                except Exception:
                    # In case of corruption, fallback to seed
                    pass
            
            # Initialize with fresh seed data
            import copy
            self._data = copy.deepcopy(INITIAL_SEED_DATA)
            self._persist_unlocked()

    def _persist_unlocked(self) -> None:
        os.makedirs(os.path.dirname(os.path.abspath(self.file_path)), exist_ok=True)
        # Atomic write pattern
        temp_file = f"{self.file_path}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, self.file_path)

    def get_all(self, collection: str) -> List[Dict[str, Any]]:
        with self._lock:
            import copy
            return copy.deepcopy(self._data.get(collection, []))

    def get_by_id(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            items = self._data.get(collection, [])
            for item in items:
                if item.get("id") == item_id:
                    import copy
                    return copy.deepcopy(item)
            return None

    def insert(self, collection: str, item: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if collection not in self._data:
                self._data[collection] = []
            
            import copy
            item_copy = copy.deepcopy(item)
            if "created_at" not in item_copy:
                item_copy["created_at"] = datetime.now(timezone.utc).isoformat()
                
            self._data[collection].append(item_copy)
            self._persist_unlocked()
            return copy.deepcopy(item_copy)

    def update(self, collection: str, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            items = self._data.get(collection, [])
            for i, item in enumerate(items):
                if item.get("id") == item_id:
                    items[i].update(updates)
                    self._persist_unlocked()
                    import copy
                    return copy.deepcopy(items[i])
            return None

    def delete(self, collection: str, item_id: str) -> bool:
        with self._lock:
            items = self._data.get(collection, [])
            for i, item in enumerate(items):
                if item.get("id") == item_id:
                    del items[i]
                    self._persist_unlocked()
                    return True
            return False

    def reset_to_seed(self) -> None:
        with self._lock:
            import copy
            self._data = copy.deepcopy(INITIAL_SEED_DATA)
            self._persist_unlocked()

# Global singleton instance for application use
store = JsonStore()
