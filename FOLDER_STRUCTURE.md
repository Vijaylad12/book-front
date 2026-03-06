# Folder Structure

## Frontend (`client/`)

```
client/
├── dist/
├── public/
├── node_modules/
└── src/
    ├── components/
    ├── context/
    ├── pages/
    │   ├── Admin/
    │   ├── Auth/
    │   ├── Books/
    │   ├── Dashboard/
    │   ├── Rentals/
    │   └── Wishlist/
    ├── services/
    └── styles/
```

| Folder | Purpose |
|---|---|
| `dist/` | Production build output |
| `public/` | Static assets |
| `src/components/` | Reusable UI components (Navbar, BookCard, etc.) |
| `src/context/` | React Context providers (AuthContext) |
| `src/pages/` | Page-level components grouped by feature |
| `src/services/` | API communication layer |
| `src/styles/` | Global stylesheets |

---

## Backend (`server/`)

```
server/
├── node_modules/
├── uploads/
│   ├── images/
│   └── pdfs/
└── src/
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── repositories/
    ├── routes/
    ├── services/
    └── utils/
```

| Folder | Purpose |
|---|---|
| `uploads/` | User-uploaded files (images & PDFs) |
| `src/config/` | Configuration (database, env, Swagger) |
| `src/controllers/` | Request handlers |
| `src/middlewares/` | Express middleware (auth, RBAC, error handling, file upload) |
| `src/repositories/` | Data access layer (SQL queries) |
| `src/routes/` | API route definitions |
| `src/services/` | Business logic layer |
| `src/utils/` | Utility/helper functions (email, JWT, OTP, response) |
