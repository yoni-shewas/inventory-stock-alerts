<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category_id'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    
    public function stockIn($warehouseId)
    {
        return $this->stocks()->where('warehouse_id', $warehouseId)->first();
    }

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'stock')
                    ->withPivot('quantity', 'reorder_level')
                    ->withTimestamps();
    }
}