# Investigations

Research, root cause analyses, and implementation notes for features and incidents.

| # | File | Topic |
|---|---|---|
| 01 | [ai-integration.md](01-ai-integration.md) | MCP architecture, NL→3D pipeline, subscription limits, shared objects, V-Ray rendering |
| 02 | [admin-dashboard.md](02-admin-dashboard.md) | Inline plan/role/status editing, Plans page, Roles & RBAC page, impersonation |
| 03 | [sidebar-scroll.md](03-sidebar-scroll.md) | Settings panel scroll bug — `overflow-hidden` + `min-h-0` fix |
| 04 | [account-inline-edit.md](04-account-inline-edit.md) | Account page name editing — API route + client UX |
| 05 | [git-credentials-incident.md](05-git-credentials-incident.md) | Firebase key committed to git — filter-branch cleanup + revocation steps |
| 06 | [06-tripo3d-platform-overview.md](06-tripo3d-platform-overview.md) | Tripo3D platform: AI 3D generation, DCC Bridge (Blender/Maya/Unity/UE/Godot), pricing, free gallery |
| 07 | [07-tripo3d-api-mcp.md](07-tripo3d-api-mcp.md) | Tripo3D REST API (v2/v3), JS SDK, official + community MCP servers, credit pricing |
| 08 | [08-free-3d-model-marketplaces.md](08-free-3d-model-marketplaces.md) | Free 3D model sources with API access: Sketchfab, Poly Pizza, Smithsonian, comparison table |
| 09 | [09-global-model-catalog-architecture.md](09-global-model-catalog-architecture.md) | Global model catalog design: S3 storage, Postgres schema, "New" tag (10-day auto-expiry), ingestion pipeline |
| 10 | [10-dcc-bridge-concept.md](10-dcc-bridge-concept.md) | DCC Bridge architecture patterns: WebSocket, file-watch, REST polling; how Tripo's bridges work |
