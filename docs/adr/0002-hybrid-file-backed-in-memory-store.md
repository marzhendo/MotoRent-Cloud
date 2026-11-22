# 2. Hybrid File-Backed In-Memory Store

Date: 2026-11-22  
Status: Accepted

## Context
While the course rubric strictly forbids external databases (RDBMS/NoSQL), relying purely on volatile RAM variables means all test transactions, mock vehicles, and registered customers disappear whenever the FastAPI process restarts or during AWS deployment updates.

## Decision
We store data in a Python dictionary during runtime, but synchronize it automatically with a local `backend/data/store.json` file on write operations. If the file does not exist, the application initializes itself with predefined seed data (5 vehicles and 3 customers).

## Consequences
- Complies with the "no external database" constraint (no SQL, no external daemons, no database migrations).
- Ensures durability between server reboots and live demonstrations to the course instructor.
- Single-writer thread-safe lock ensures atomic operations in the local Python process.
