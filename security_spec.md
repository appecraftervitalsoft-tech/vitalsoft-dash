# Security Specification - Gym Tracker Firestore ABAC Rules

## 1. Data Invariants
1. **Gym Settings Integrity**: The `gymSettings` document must have an ID conforming to `isValidId()` and `gymName` must be non-empty string under 100 characters.
2. **Client Document Integrity**: Every `clients` record must possess a valid ID, clean DNI, valid goal, valid level (`principiante`, `intermedio`, `avanzado`), and non-empty name.
3. **Coach Document Integrity**: Every `coaches` record must possess a valid ID, non-empty DNI, and name.
4. **Routine Day Integrity**: Every `clientRoutines` record must link to an existing `clientId` and contain valid `dayName`, `title`, and exercise structures.
5. **Completed Workout Immutability**: Historical workouts cannot have their `clientId`, `routineDayId`, or `date` altered once created.
6. **Live Active Session Synchronization**: Real-time workout sessions must reference a valid `clientId`, bound string lengths, and safe counters.

## 2. The "Dirty Dozen" Malicious Payloads (Tested for Rejection)
1. **Payload 1 (Ghost Field Injection in Client)**: `{ "id": "client_1", "dni": "12345678", "name": "Fake", "isAdmin": true }` -> Rejected because `isAdmin` is not allowed.
2. **Payload 2 (Oversized ID String Denial of Wallet)**: `{ "id": "a".repeat(2000), "dni": "12345678" }` -> Rejected by `isValidId()` length limit.
3. **Payload 3 (Negative or NaN Body Weight)**: `{ "bodyWeightKg": -50 }` -> Rejected by type and positive numerical boundary checks.
4. **Payload 4 (Invalid Level Enum Poisoning)**: `{ "level": "super_saiyan" }` -> Rejected by level enum validation.
5. **Payload 5 (Unbounded Exercise Array Attack)**: Array of 10,000 items -> Rejected by array size boundary (`exercises.size() <= 50`).
6. **Payload 6 (Coach DNI Spoofing)**: Trying to update another coach's profile without identification.
7. **Payload 7 (Completed Workout Tampering)**: Modifying `clientId` or `date` on an existing finished workout log.
8. **Payload 8 (Oversized Gym Name Payload)**: Setting `gymName` to a 50KB string -> Rejected by length restriction.
9. **Payload 9 (Live Session Invariant Violation)**: Submitting negative duration or negative completed sets count.
10. **Payload 10 (Script Injection in DNI)**: Submitting `<script>alert(1)</script>` -> Rejected by regex `^[a-zA-Z0-9_-]+$`.
11. **Payload 11 (Orphaned Routine Day)**: Routine day without `clientId` -> Rejected by required keys.
12. **Payload 12 (Blanket Catch-All Bypass)**: Attempting to read or write to undeclared collections (e.g. `/secret_keys/doc`) -> Rejected by default deny.
