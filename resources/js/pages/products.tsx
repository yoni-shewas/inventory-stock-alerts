import { Head } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TransferModal,
    type TransferData,
} from '@/components/transfer-modal';
import {
    ArrowLeftRight,
    Package,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    category: string;
    warehouse_a_qty: number;
    warehouse_b_qty: number;
    reorder_level: number;
    status: 'OK' | 'Shortage';
}

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [transferData, setTransferData] = useState<TransferData | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, warehousesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/warehouses'),
            ]);
            const productsData = await productsRes.json();
            const warehousesData = await warehousesRes.json();
            setProducts(productsData);
            setWarehouses(warehousesData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSuggestTransfer = (product: Product) => {
        const whA = warehouses.find((w) => w.code === 'A');
        const whB = warehouses.find((w) => w.code === 'B');
        if (!whA || !whB) return;

        // Source = warehouse with more stock, destination = the one that's short
        const sourceIsA = product.warehouse_a_qty >= product.warehouse_b_qty;

        setTransferData({
            productId: product.id,
            productName: product.name,
            reorderLevel: product.reorder_level,
            fromWarehouseId: sourceIsA ? whA.id : whB.id,
            fromWarehouseName: sourceIsA ? whA.name : whB.name,
            fromWarehouseQty: sourceIsA ? product.warehouse_a_qty : product.warehouse_b_qty,
            toWarehouseId: sourceIsA ? whB.id : whA.id,
            toWarehouseName: sourceIsA ? whB.name : whA.name,
            toWarehouseQty: sourceIsA ? product.warehouse_b_qty : product.warehouse_a_qty,
        });
        setModalOpen(true);
    };

    const shortageCount = products.filter(
        (p) => p.status === 'Shortage',
    ).length;

    return (
        <>
            <Head title="Products" />
            <div className="flex min-h-screen flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Package className="h-6 w-6" />
                            Product Inventory
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Monitor stock levels across warehouses and manage
                            transfers.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {shortageCount > 0 && !loading && (
                            <Badge
                                variant="destructive"
                                className="gap-1 px-3 py-1"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {shortageCount} Shortage
                                {shortageCount > 1 ? 's' : ''}
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            disabled={loading}
                            className="gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Table card */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4"
                                >
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package className="h-12 w-12 text-muted-foreground/40" />
                            <h3 className="mt-4 text-lg font-semibold">
                                No products found
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Products will appear here once they're added to
                                the system.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="pl-4 font-semibold">
                                        Product Name
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Category
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Warehouse A
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Warehouse B
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Reorder Level
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="pr-4 text-right font-semibold">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className={
                                            product.status === 'Shortage'
                                                ? 'bg-destructive/5 hover:bg-destructive/10 dark:bg-destructive/10 dark:hover:bg-destructive/15'
                                                : ''
                                        }
                                    >
                                        <TableCell className="pl-4 font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {product.category}
                                        </TableCell>
                                        <TableCell className="text-center tabular-nums">
                                            <StockBadge
                                                qty={product.warehouse_a_qty}
                                                reorderLevel={
                                                    product.reorder_level
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center tabular-nums">
                                            <StockBadge
                                                qty={product.warehouse_b_qty}
                                                reorderLevel={
                                                    product.reorder_level
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center tabular-nums text-muted-foreground">
                                            {product.reorder_level}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {product.status === 'OK' ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                >
                                                    OK
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Shortage
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-4 text-right">
                                            {product.status === 'Shortage' && (() => {

                                                //to check if there is surplus stock in the other warehouse
                                                const canTransferFromA = product.warehouse_a_qty > product.reorder_level && product.warehouse_b_qty < product.reorder_level;
                                                const canTransferFromB = product.warehouse_b_qty > product.reorder_level && product.warehouse_a_qty < product.reorder_level;

                                                if (canTransferFromA || canTransferFromB) {
                                                    return (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                                                            onClick={() => handleSuggestTransfer(product)}
                                                        >
                                                            <ArrowLeftRight className="h-3.5 w-3.5" />
                                                            Suggest Transfer
                                                        </Button>
                                                    );
                                                }


                                                return (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 hover:text-blue-800"
                                                    >
                                                        Purchase More
                                                    </Button>
                                                );
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Summary footer */}
                {!loading && products.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Showing {products.length} product
                        {products.length > 1 ? 's' : ''} across 2 warehouses.
                    </p>
                )}
            </div>

            <TransferModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                data={transferData}
                onSuccess={fetchData}
            />
        </>
    );
}

function StockBadge({
    qty,
    reorderLevel,
}: {
    qty: number;
    reorderLevel: number;
}) {
    const isLow = qty < reorderLevel;
    return (
        <span
            className={
                isLow
                    ? 'font-semibold text-destructive'
                    : 'text-foreground'
            }
        >
            {qty}
        </span>
    );
}

Products.layout = (page: React.ReactNode) => <>{page}</>;
