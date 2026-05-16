- [x] Inspect frontend App.tsx and identify all hardcoded arrays and logic
- [x] Confirm backend endpoints for restaurants/tables/reservations/requests and expected payloads
- [ ] Implement frontend API layer usage (fetch/mutate) for customer + admin (needs API wiring in App.tsx)

- [x] Confirm customer session time should be fixed (90 min) and next session starts after previous ends


- [ ] Remove hardcoded RESTAURANTS / INITIAL_* arrays and related state
- [ ] Remove hardcoded-admin email allowlist logic from login
- [ ] Wire Customer: discover (GET restaurants), reservations (GET by customer), create (POST reservation), cancel (PATCH cancel)
- [ ] Wire Customer booking flow to backend: choose restaurant + table + date + start_time; compute end_time using fixed session duration
- [ ] Support “multiple continuous sessions”: create sequential reservations per session (end of session == start of next)
- [ ] Wire Admin: tables CRUD (GET/POST/PUT/PATCH/DELETE tables), pending requests (GET pending reservations), approve/reject via backend
- [ ] Update UI types so status strings map correctly
- [ ] Test locally: run backend + frontend and verify end-to-end


