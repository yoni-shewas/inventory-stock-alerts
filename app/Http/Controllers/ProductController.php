<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'stocks.warehouse'])
            ->get()
            ->map(function ($product) {
                $stockA = $product->stocks->firstWhere('warehouse.code', 'A');
                $stockB = $product->stocks->firstWhere('warehouse.code', 'B');

                return [
                    'id'                => $product->id,
                    'name'              => $product->name,
                    'category'          => $product->category?->name ?? 'N/A',
                    'warehouse_a_qty'   => $stockA?->quantity ?? 0,
                    'warehouse_b_qty'   => $stockB?->quantity ?? 0,
                    'reorder_level'     => $stockA?->reorder_level ?? $stockB?->reorder_level ?? 0,
                    'status'            => $this->getStatus($stockA, $stockB),
                ];
            });

        return response()->json($products);
    }

    private function getStatus($stockA, $stockB): string
    {
        if (($stockA && $stockA->quantity < $stockA->reorder_level) ||
            ($stockB && $stockB->quantity < $stockB->reorder_level)) {
            return 'Shortage';
        }
        return 'OK';
    }
}
