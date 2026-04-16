# Inventory with Stock Alerts

## Overview
This project is an inventory management system designed to track products and automate stock optimization across multiple warehouses. It detects stock shortages in real-time and calculates logical inter-warehouse transfers to maintain optimal inventory levels. The application focuses on high-performance data retrieval, specifically engineered to calculate complex shortage reports using minimal database queries.

## Technical Stack
- **Backend**: Laravel
- **Frontend**: React (via Inertia.js)
- **Database**: Relational Database PostgreSQL

## Database Architecture
The database schema implements standard normalization to support inventory operations:
- **Products**: Core inventory items.
- **Categories**: Many-to-one relationship with products.
- **Warehouses**: Storage locations managing the stock.
- **Stock (Pivot)**: Connects products and warehouses (many-to-many). Tracks `product_id`, `warehouse_id`, `quantity`, and `reorder_level`.
- **Stock Movements**: Immutable ledger recording inventory transitions. Records `product_id`, `from_warehouse_id`, `to_warehouse_id`, `quantity`, and `type` (in/out/transfer) used transaction to fix missing inventory incase of failed transaction.

## Core Functionality

### Performance and Optimization
- Calculations for shortage reports strictly operate via the database engine (capped at two queries maximum).
- Application-level loop processing is entirely bypassed for analytical reports.
- Comprehensive eager-loading is enforced natively to eliminate any N+1 query regression.

### API Specifications
1. **GET `/api/report/shortages`**
   - Identifies product stock counts that have breached their designated lower-bound limit (`quantity < reorder_level`).
   - Concurrently evaluates the opposing warehouse for excess stock capability (`quantity > reorder_level`).
   - Returns a structured suggestion mapping the viable source and destination constraints, completed within highly constrained query limits.

2. **POST `/api/transfer`**
   - Transacts standard stock movement payloads (`product_id`, `from_warehouse_id`, `to_warehouse_id`, `quantity`).
   - Enveloped in atomic database transactions to guarantee data congruency alongside concurrent traffic.
   - Updates disparate pivot totals and materializes bidirectional logs in the stock movements registry.

3. **GET `/api/products`**
   - Aggregates the standard product catalog bound with multi-warehouse metrics.
   - Flattens nested relations into direct keys (e.g. `warehouse_a_qty`, `warehouse_b_qty`).

### Frontend Interface
The client is developed entirely using React functional components.

- **Inventory Matrix**: A single comprehensive data table rendering Product Name, Category mapping, respective Warehouse metrics, Reorder parameters, and actionable Status limits (OK vs Shortage).
- **Proactive Resolution UI**: For rows actively reporting a shortage breach, a transfer trigger provisions a preemptive action.
- **Seamless Transfers**: Interaction automatically scaffolds the transfer payload utilizing the source suggested by the backend. Upon successful execution, state mutation cascades naturally to refresh UI bounds without hard reloads.

## DB setup
Using posgress for the databse for efficent data retrieval


```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=inventory_db
   DB_USERNAME=inventory_user
```

## Environment Setup

1. Install backend dependencies via Composer.
   ```bash
   composer install
   ```
2. Install frontend dependencies via Node Package Manager.
   ```bash
   npm install
   ```
3. Initialize the environment parameters.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Their is a defined seed file and make sure the .env has necessary configuration for the db connection
   ```bash
   php artisan migrate --seed
   ```
5. Boot system application servers
   ```bash
   php artisan serve & npm run dev
   ```

## Status
This repository serves as the final delivery and meets all the operational, architectural, and data retrieval criteria set forth by the case study prompt requirements.
