# Northwatch Database Schema Architecture

Entity-Relationship Diagram and architectural reference for the Neon Postgres database managed by Drizzle ORM.

---

## 1. Visual Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    user ||--o{ session : "1:N has"
    user ||--o{ account : "1:N has"
    user ||--o{ orders : "1:N places"
    
    products ||--|{ product_variants : "1:N contains"
    orders ||--|{ order_items : "1:N contains"
    products ||--o{ order_items : "referenced by (RESTRICT)"
    product_variants ||--o{ order_items : "referenced by (RESTRICT)"

    user {
        text id PK "Better Auth ID"
        text name "Full name"
        text email UK "Unique email"
        boolean email_verified
        text image "Avatar URL"
        timestamp created_at
        timestamp updated_at
    }

    session {
        text id PK
        text token UK "Session token"
        text user_id FK "Cascade delete"
        timestamp expires_at
        text ip_address
        text user_agent
        timestamp created_at
        timestamp updated_at
    }

    account {
        text id PK
        text user_id FK "Cascade delete"
        text provider_id "google | github"
        text account_id "OAuth provider ID"
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password "Nullable hash"
        timestamp created_at
        timestamp updated_at
    }

    verification {
        text id PK
        text identifier "Email or token key"
        text value "Verification hash"
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    products {
        text id PK "UUID"
        text title "e.g. The Field Chronograph"
        text slug UK "URL slug"
        text reference_code UK "e.g. NW-01-GMT"
        text description
        text case_diameter "e.g. 40mm"
        text movement "e.g. Automatic 4Hz"
        text water_resistance "e.g. 100m"
        text editorial_quote "v1 PDP quote"
        text quote_author
        boolean featured
        timestamp created_at
        timestamp updated_at
    }

    product_variants {
        text id PK "UUID"
        text product_id FK "Cascade delete"
        text sku UK "e.g. NW-01-GMT-STL"
        text name "e.g. Basalt / Calf"
        text dial_color
        text strap_material
        text case_finish
        integer price_cents "Integer cents"
        integer stock "CHECK >= 0"
        jsonb images "Array of URLs"
        timestamp created_at
        timestamp updated_at
    }

    orders {
        text id PK "UUID"
        text user_id FK "Set null on user delete"
        text email "Customer email"
        order_status status "ENUM pending_payment | paid | shipped | delivered | canceled | refunded"
        integer subtotal_cents "Cents"
        integer shipping_cents "Cents"
        integer tax_cents "Cents"
        integer total_cents "Cents"
        text shipping_tier_id "standard | express | priority"
        jsonb shipping_address "Validated recipient details"
        text stripe_payment_intent_id UK "pi_..."
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        text id PK "UUID"
        text order_id FK "Cascade delete"
        text product_id FK "RESTRICT delete"
        text variant_id FK "RESTRICT delete"
        integer quantity "Item count"
        integer unit_price_cents "Snapshot price in cents"
        text title "Snapshot product title"
        text variant_name "Snapshot variant name"
    }

    processed_webhook_events {
        text id PK "Stripe event id (evt_...)"
        text event_type "e.g. payment_intent.succeeded"
        timestamp processed_at
    }
```

---

## 2. Invariant Checklist

1. **Monetary Integrity**: All prices, taxes, shipping fees, and totals are strictly stored as `integer` cents (e.g. `$740.00` = `74000`).
2. **Historical Integrity**: `order_items` snapshots `title`, `variant_name`, and `unit_price_cents` so historical invoices never mutate if a product is updated or discontinued.
3. **Inventory Safety**: `CHECK ("stock" >= 0)` on `product_variants` prevents race conditions from driving stock into negative values.
4. **Webhook Idempotency**: `processed_webhook_events` logs Stripe event IDs to ensure duplicate webhooks are safely ignored.
5. **Enums**: `order_status` is an immutable PostgreSQL ENUM preventing malformed status states.
