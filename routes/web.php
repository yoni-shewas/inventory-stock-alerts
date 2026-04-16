<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');



Route::prefix('api')->group(function () {

    // Warehouses
    Route::get('/warehouses', [App\Http\Controllers\WarehouseController::class, 'index'])
         ->name('warehouses.index');

    // Products
    Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])
         ->name('products.index');

    // Shortage Report
    Route::get('/report/shortages', [App\Http\Controllers\ShortageReportController::class, 'index'])
         ->name('shortages.index');

    // Stock Transfer
    Route::post('/transfer', [App\Http\Controllers\TransferController::class, 'store'])
         ->name('transfers.store');
});


// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::inertia('dashboard', 'dashboard')->name('dashboard');
// });

