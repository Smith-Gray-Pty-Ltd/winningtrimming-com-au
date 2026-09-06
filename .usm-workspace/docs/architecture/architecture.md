# Architecture Diagram

Auto-generated from `.usm/system.usm` services + `depends_on`.

```mermaid
graph TD

    %% App Services
    subgraph "App Services"
        template_website/service["Service<br/>port 3000<br/>nextjs"]
    end

    %% Relationships

    style template_website/service fill:#64748b,color:#fff
```
