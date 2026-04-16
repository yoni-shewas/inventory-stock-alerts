<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShortageReportController extends Controller
{
  
    public function index(): JsonResponse
    {
        $warehouseA = Warehouse::where('code', 'A')->value('id');
        $warehouseB = Warehouse::where('code', 'B')->value('id');

        if (!$warehouseA || !$warehouseB) {
            return response()->json(['error' => 'Warehouses not configured properly'], 500);
        }

        // Query 1: Get all stock records that are below reorder level
        $shortageStocks = Stock::where('quantity', '<', DB::raw('reorder_level'))
            ->with(['product.category', 'warehouse'])
            ->get();

        // Query 2: Get stock for the other warehouse for each product (only for shortage products)
        $productIds = $shortageStocks->pluck('product_id')->unique();

        $otherStocks = Stock::whereIn('product_id', $productIds)
            ->whereIn('warehouse_id', [$warehouseA, $warehouseB])
            ->get()
            ->keyBy('product_id');

        $result = $shortageStocks->map(function ($stock) use ($otherStocks, $warehouseA, $warehouseB) {
            $shortWarehouseId = $stock->warehouse_id;
            $sourceWarehouseId = $shortWarehouseId === $warehouseA ? $warehouseB : $warehouseA;

            $sourceStock = $otherStocks->firstWhere('product_id', $stock->product_id)
                         ?? $otherStocks->firstWhere(fn($s) => $s->warehouse_id === $sourceWarehouseId);

            $canTransfer = $sourceStock && $sourceStock->quantity > $sourceStock->reorder_level;

            return [
                'product_id'          => $stock->product->id,
                'name'                => $stock->product->name,
                'category'            => $stock->product->category?->name ?? 'N/A',
                'short_warehouse'     => $stock->warehouse->name,
                'short_warehouse_id'  => $stock->warehouse_id,
                'current_quantity'    => $stock->quantity,
                'reorder_level'       => $stock->reorder_level,
                'suggested_source_id' => $canTransfer ? $sourceWarehouseId : null,
                'suggested_source'    => $canTransfer ? ($sourceWarehouseId === $warehouseA ? 'Warehouse A' : 'Warehouse B') : null,
                'source_available'    => $canTransfer ? $sourceStock->quantity : 0,
            ];
        })->filter(fn($item) => $item['suggested_source_id'] !== null); 

        return response()->json($result->values());
    }
}