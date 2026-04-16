import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';

export interface TransferData {
    productId: number;
    productName: string;
    reorderLevel: number;
    fromWarehouseId: number;
    fromWarehouseName: string;
    fromWarehouseQty: number;
    toWarehouseId: number;
    toWarehouseName: string;
    toWarehouseQty: number;
}

interface TransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: TransferData | null;
    onSuccess: () => void;
}

export function TransferModal({
    open,
    onOpenChange,
    data,
    onSuccess,
}: TransferModalProps) {
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 1) {
            setError('Please enter a valid quantity (min 1).');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    product_id: data.productId,
                    from_warehouse_id: data.fromWarehouseId,
                    to_warehouse_id: data.toWarehouseId,
                    quantity: qty,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(
                    result.error ||
                        result.message ||
                        'Transfer failed. Please try again.',
                );
            }

            toast.success('Transfer completed successfully!', {
                description: `Moved ${qty} units from ${data.fromWarehouseName} to ${data.toWarehouseName}.`,
            });

            setQuantity('');
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'An error occurred.';
            setError(message);
            toast.error('Transfer failed', { description: message });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (value: boolean) => {
        if (!value) {
            setQuantity('');
            setError('');
        }
        onOpenChange(value);
    };

    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>Stock Transfer</span>
                    </DialogTitle>
                    <DialogDescription>
                        Transfer stock for{' '}
                        <span className="font-semibold text-foreground">
                            {data.productName}
                        </span>
                        <div className="mt-1.5 text-xs">
                            <span className="text-muted-foreground">Reorder Level: </span>
                            <span className="font-medium text-foreground">{data.reorderLevel}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} id="transfer-form">
                    <div className="space-y-4 py-4">
                        {/* Route visualization */}
                        <div className="flex items-center justify-center gap-6 rounded-lg bg-muted/50 p-4">
                            <div className="text-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Source
                                </p>
                                <p className="text-sm font-semibold">
                                    {data.fromWarehouseName}
                                </p>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-1">
                                    {data.fromWarehouseQty} available
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Destination
                                </p>
                                <p className="text-sm font-semibold">
                                    {data.toWarehouseName}
                                </p>
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mt-1">
                                    {data.toWarehouseQty} current
                                </p>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="transfer-quantity">Quantity</Label>
                            <Input
                                id="transfer-quantity"
                                type="number"
                                min={1}
                                placeholder="Enter quantity to transfer"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="text-sm font-medium text-destructive">
                                {error}
                            </p>
                        )}
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="transfer-form"
                        disabled={loading || !quantity}
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Transfer Stock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}
