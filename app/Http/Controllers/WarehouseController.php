<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
    /**
     * Display a listing of warehouses
     */
    public function index(): JsonResponse
    {
        $warehouses = Warehouse::select('id', 'name', 'code')->get();

        return response()->json($warehouses);
    }
}