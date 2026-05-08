# Go-live Evidence Snapshot

- Generated at (UTC): 2026-05-08T23:26:49.034Z
- Base URL: http://localhost:3000
- Timeout per check: 45000ms
- Auth header used: none
- Summary: 0/4 passed, 4 failed

| Check | Expected | Actual | Result | Latency |
|---|---:|---:|---|---:|
| `/api/health` | 200 | ERR | ❌ FAIL | 110ms |
| ↳ error | - | - | fetch failed | - |
| `/api/ops/readiness` | 200 | ERR | ❌ FAIL | 5ms |
| ↳ error | - | - | fetch failed | - |
| `/api/public/search?city=Bangkok` | 200 | ERR | ❌ FAIL | 4ms |
| ↳ error | - | - | fetch failed | - |
| `/api/billing/portal` | 401 | ERR | ❌ FAIL | 5ms |
| ↳ error | - | - | fetch failed | - |

## Next action
- ยังมี endpoint ที่ไม่ผ่าน ให้แก้แล้วรันซ้ำก่อน sign-off
