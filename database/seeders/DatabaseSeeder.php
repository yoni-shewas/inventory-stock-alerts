<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE stock, products, categories, warehouses CASCADE;');

        // Warehouses
        $warehouseA = Warehouse::create(['name' => 'Warehouse A', 'code' => 'A']);
        $warehouseB = Warehouse::create(['name' => 'Warehouse B', 'code' => 'B']);

        // Categories
        $electronics = Category::create(['name' => 'Electronics']);
        $clothing = Category::create(['name' => 'Clothing']);
        $groceries = Category::create(['name' => 'Groceries']);

        // Products
        $laptop = Product::create(['name' => 'Laptop', 'category_id' => $electronics->id]);
        $phone = Product::create(['name' => 'Phone', 'category_id' => $electronics->id]);
        $tshirt = Product::create(['name' => 'T-Shirt', 'category_id' => $clothing->id]);
        $shoes = Product::create(['name' => 'Shoes', 'category_id' => $clothing->id]);
        $apple = Product::create(['name' => 'Apple', 'category_id' => $groceries->id]);

        // Stock Scenarios
        // 1. Laptop: Shortage in A, excess in B
        Stock::create(['product_id' => $laptop->id, 'warehouse_id' => $warehouseA->id, 'quantity' => 2, 'reorder_level' => 5]);
        Stock::create(['product_id' => $laptop->id, 'warehouse_id' => $warehouseB->id, 'quantity' => 20, 'reorder_level' => 5]);

        // 2. Phone: Shortage in B, excess in A
        Stock::create(['product_id' => $phone->id, 'warehouse_id' => $warehouseA->id, 'quantity' => 30, 'reorder_level' => 10]);
        Stock::create(['product_id' => $phone->id, 'warehouse_id' => $warehouseB->id, 'quantity' => 5, 'reorder_level' => 10]);

        // 3. T-Shirt: OK in both
        Stock::create(['product_id' => $tshirt->id, 'warehouse_id' => $warehouseA->id, 'quantity' => 50, 'reorder_level' => 10]);
        Stock::create(['product_id' => $tshirt->id, 'warehouse_id' => $warehouseB->id, 'quantity' => 45, 'reorder_level' => 10]);

        // 4. Shoes: Shortage in A, NO excess in B
        Stock::create(['product_id' => $shoes->id, 'warehouse_id' => $warehouseA->id, 'quantity' => 4, 'reorder_level' => 10]);
        Stock::create(['product_id' => $shoes->id, 'warehouse_id' => $warehouseB->id, 'quantity' => 8, 'reorder_level' => 10]);

        // 5. Apple: Shortage in both
        Stock::create(['product_id' => $apple->id, 'warehouse_id' => $warehouseA->id, 'quantity' => 1, 'reorder_level' => 20]);
        Stock::create(['product_id' => $apple->id, 'warehouse_id' => $warehouseB->id, 'quantity' => 2, 'reorder_level' => 20]);
    }
}
