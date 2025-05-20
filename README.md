├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  ├─ auth
│  │  ├─ auth.controller.ts
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.ts
│  │  ├─ dto
│  │  │  ├─ login.dto.ts
│  │  │  └─ refresh-token.dto.ts
│  │  ├─ guards
│  │  │  ├─ jwt-auth.guard.ts
│  │  │  └─ local-auth.guard.ts
│  │  └─ strategies
│  │     ├─ google.strategy.ts
│  │     ├─ jwt.strategy.ts
│  │     └─ local.strategy.ts
│  ├─ config
│  │  └─ configuration.ts
│  ├─ main.ts
│  └─ users
│     ├─ dto
│     │  ├─ create-user.dto.ts
│     │  └─ update-user.dto.ts
│     ├─ entities
│     │  └─ user.entity.ts
│     ├─ users.controller.ts
│     ├─ users.module.ts
│     └─ users.service.ts
├─ test
│  ├─ app.e2e-spec.ts
│  ├─ auth.e2e-spec.ts
│  └─ jest-e2e.json
├─ tsconfig.build.json
└─ tsconfig.json

```