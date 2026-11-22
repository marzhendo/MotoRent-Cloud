# 1. In-Memory JSON Store with FastAPI Backend

Date: 2026-11-22  
Status: Accepted

## Context
For the course CAK3EAB3 Komputasi Awan dan Terdistribusi (Telkom University Purwokerto), the assignment specifications for MotoRent Cloud explicitly state: *"Please don't use a database for this course. All potential persistence data is hardcoded using JSON/DICT data type."* We must build a decoupled web application with full CRUD across at least three entities (`Customer`, `Vehicle`, `Rental`) and multi-entity transaction logic that will be deployed to AWS.

## Decision
We chose **FastAPI (Python)** for the backend service and an **In-Memory JSON Store** (Python dictionary structure backed by seed data) for data management.

1. **FastAPI**: Provides high-performance asynchronous HTTP handling, built-in Pydantic data validation/schemas, and out-of-the-box OpenAPI / Swagger UI documentation (`/docs`) which is ideal for grading and live testing.
2. **In-Memory JSON Persistence**: All entity data will reside in memory as dictionaries/JSON objects, satisfying the course constraint while providing microsecond response times. An optional local file synchronization (`data/store.json`) can be enabled so mutations survive server restarts during development and testing without introducing external database dependencies.

## Consequences
- Zero external database setup, making local running and EC2 deployment trivial.
- Data is constrained to single-node memory semantics unless synced via file/EFS, which perfectly aligns with the current scope of the cloud course assignment.
