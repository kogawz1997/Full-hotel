# Go-live Evidence Snapshot

- Generated at (UTC): 2026-05-08T22:20:42.067Z
- Base URL: http://localhost:3000
- Summary: 0/4 passed, 4 failed

| Check | Expected | Actual | Result | Latency |
|---|---:|---:|---|---:|
| `/api/health` | 200 | ERR | ❌ FAIL | 92ms |
| ↳ error | - | - | fetch failed | - |
| `/api/ops/readiness` | 200 | ERR | ❌ FAIL | 5ms |
| ↳ error | - | - | fetch failed | - |
| `/api/public/search?city=Bangkok` | 200 | ERR | ❌ FAIL | 3ms |
| ↳ error | - | - | fetch failed | - |
| `/api/billing/portal` | 401 | ERR | ❌ FAIL | 3ms |
| ↳ error | - | - | fetch failed | - |

## Next action
- ยังมี endpoint ที่ไม่ผ่าน ให้แก้แล้วรันซ้ำก่อน sign-off
