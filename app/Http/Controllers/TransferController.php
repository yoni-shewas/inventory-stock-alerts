<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    /**
     * Perform stock transfer between warehouses
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'         => 'required|exists:products,id',
            'from_warehouse_id'  => 'required|exists:warehouses,id',
            'to_warehouse_id'    => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity'           => 'required|integer|min:1',
        ]);

        try {
            //to ensure data integrity, we use a transaction
            DB::transaction(function () use ($request) {

                // Deduct from source
                $fromStock = Stock::where('product_id', $request->product_id)
                    ->where('warehouse_id', $request->from_warehouse_id)
                    ->firstOrFail();

                if ($fromStock->quantity < $request->quantity) {
                    throw new \Exception('Insufficient stock in source warehouse.');
                }

                $fromStock->decrement('quantity', $request->quantity);

                // Add to destination (or create if not exists)
                $toStock = Stock::firstOrCreate(
                    [
                        'product_id'   => $request->product_id,
                        'warehouse_id' => $request->to_warehouse_id,
                    ],
                    [
                        'quantity'       => 0,
                        'reorder_level'  => 0,
                    ]
                );

                $toStock->increment('quantity', $request->quantity);

                // Create stock movements
                StockMovement::create([
                    'product_id'        => $request->product_id,
                    'from_warehouse_id' => $request->from_warehouse_id,
                    'to_warehouse_id'   => null,
                    'quantity'          => $request->quantity,
                    'type'              => 'out',
                    'notes'             => 'Transfer out',
                ]);

                StockMovement::create([
                    'product_id'        => $request->product_id,
                    'from_warehouse_id' => null,
                    'to_warehouse_id'   => $request->to_warehouse_id,
                    'quantity'          => $request->quantity,
                    'type'              => 'in',
                    'notes'             => 'Transfer in',
                ]);
            });

            return response()->json([
                'message' => 'Stock transfer completed successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 422);
        }
    }
}