import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrder } from "@/hooks/core/use-orders";
import { useProducts } from "@/hooks/core/use-products";
import { useCategories, useBrands } from "@/lib/core/category-cache";
import { apiClient } from "@/lib/core/api-client";
import { useAuth } from "@/lib/core/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/core/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Package,
  X,
  Layers,
  Tag,
  Edit,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Check,
} from "lucide-react";

import { effectivePrice, formatBDT } from "@/utils/core/orderHelper";
import { useQueryClient } from "@tanstack/react-query";

function ProductAddDialog({
  product,
  onClose,
  onAddToCart,
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isVariant = product.type === "variant" && (product?.variants?.length ?? 0) > 0;

  const simplePrice = effectivePrice(product.price, product.offerPrice ?? null);
  const variantPrice = selectedVariant
    ? effectivePrice(selectedVariant.price, selectedVariant.offerPrice ?? null)
    : null;

  const displayPrice = isVariant ? variantPrice : simplePrice;
  const lineTotal = displayPrice != null ? displayPrice * quantity : null;

  const canAdd = isVariant ? selectedVariant !== null : true;

  const handleAdd = () => {
    if (!canAdd || displayPrice === null) return;

    const cartKey = isVariant
      ? `${product.id}__${selectedVariant.size}`
      : product.id;

    onAddToCart({
      id: cartKey,
      name: isVariant
        ? `${product.name} (${selectedVariant.size})`
        : product.name,
      price: displayPrice,
      quantity,
      image: product.image,
      sku: isVariant ? selectedVariant.sku || product.sku : product.sku,
      size: isVariant ? selectedVariant.size : "",
    });

    setSelectedVariant(null);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-snug pr-6">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isVariant
              ? "Select a size / variation to add to order"
              : "Confirm quantity to add"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 -mt-1">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs text-muted-foreground">{product.sku}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 gap-1"
              >
                {isVariant ? (
                  <>
                    <Layers className="h-2.5 w-2.5" /> Variable
                  </>
                ) : (
                  <>
                    <Tag className="h-2.5 w-2.5" /> Simple
                  </>
                )}
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {product.category}
              </Badge>
            </div>
          </div>
        </div>

        {!isVariant && (
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{formatBDT(simplePrice)}</p>
              {product.offerPrice != null &&
                product.offerPrice < product.price && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatBDT(product.price)}
                  </p>
                )}
            </div>
            <Badge
              variant={(product.stock ?? 0) > 0 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </Badge>
          </div>
        )}

        {isVariant && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Select Size / Variation
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {[...(product.variants || [])]
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((v) => {
                  const vPrice = effectivePrice(v.price, v.offerPrice ?? null);
                  const isSelected = selectedVariant?.size === v.size;
                  const hasNoStock = v.stockQuantity === 0;

                  return (
                    <button
                      key={v.size}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(isSelected ? null : v);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                            : "border-border bg-background hover:border-primary/60 hover:bg-primary/5"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                          h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}
                        `}
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="font-medium">{v.size}</span>
                        {hasNoStock && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            Out of Stock (DB)
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatBDT(vPrice)}
                        </p>
                        {v.offerPrice != null && v.offerPrice < v.price && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            {formatBDT(v.price)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {lineTotal !== null && (
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-base font-bold text-primary">
                {formatBDT(lineTotal)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter showCloseButton>
          <Button disabled={!canAdd} onClick={handleAdd} className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderDetailsPage({ params }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const id = params?.id || typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const startInEditMode = searchParams.get("edit") === "true";

  const { data: order, isLoading: orderLoading, isError: orderError } = useOrder(id);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Dhaka");
  const [customerThana, setCustomerThana] = useState("Dhaka");
  const [customerDistrict, setCustomerDistrict] = useState("Dhaka");
  const [customerZip, setCustomerZip] = useState("1000");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderStatus, setorderStatus] = useState("Pending");

  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [dialogProduct, setDialogProduct] = useState(null);

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    search: searchQuery || undefined,
    category: categoryFilter !== "All" ? categoryFilter : undefined,
    brand: brandFilter !== "All" ? brandFilter : undefined,
  });
  const products = Array.isArray(productsResponse?.data)
    ? productsResponse.data
    : [];

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer?.fullName || order.customerName || "");
      setCustomerPhone((order.customer?.phone || "").replace(/^\+880/, ""));
      setCustomerEmail(order.customer?.email || "");
      setCustomerAddress(order.customer?.address || "");
      setCustomerCity(order.customer?.city || "Dhaka");
      setCustomerThana(order.customer?.thana || "Dhaka");
      setCustomerDistrict(order.customer?.district || "Dhaka");
      setCustomerZip(order.customer?.zip || "1000");

      setPaymentMethod(order.paymentMethod || "cash");
      setorderStatus(order.orderStatus || "Pending");

      setDiscountAmount(order.discountTotalAmount || 0);
      setShippingFee(order.totals?.shippingFee ?? order.shippingTotalAmount ?? 0);

      const cartItems = (order.items || []).map((item, idx) => {
        const idKey = item.size ? `${idx}__${item.size}` : `${idx}`;
        return {
          id: idKey,
          name: item.name,
          price: item.unitPrice ?? item.price ?? 0,
          quantity: item.quantity,
          image: "",
          sku: "",
          size: item.size || "",
        };
      });
      setCart(cartItems);

      if (startInEditMode) {
        setIsEditMode(true);
      }
    }
  }, [order, startInEditMode]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name && c.size === item.size);
      if (existing) {
        return prev.map((c) =>
          c.name === item.name && c.size === item.size
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        );
      }
      return [...prev, item];
    });
    toast.success(`${item.name} added to cart`);
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const total = useMemo(
    () => Math.max(0, subtotal + shippingFee - discountAmount),
    [subtotal, shippingFee, discountAmount],
  );

  const getBackendStatus = (fullStatus) => {
    const s = fullStatus.toLowerCase();
    if (s === "processing") return "processing";
    if (s === "shipped") return "shipped";
    if (s === "cancelled") return "cancelled";
    if (s === "completed") return "completed";
    return "received";
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty. Add at least one product.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Customer Name is required.");
      return;
    }
    if (customerPhone.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit Phone Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        status: getBackendStatus(orderStatus),
        paymentMethod: paymentMethod,
        customer: {
          fullName: customerName.trim(),
          phone: `+880${customerPhone.trim()}`,
          email: customerEmail.trim() || "instore@monsuralitravels.com",
          address: customerAddress.trim() || "In-Store",
          city: customerCity,
          thana: customerThana,
          district: customerDistrict,
          zip: customerZip,
          giftWrap: false,
        },
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          size: item.size,
          concentration: "",
          productDid: "",
        })),
        totals: {
          subtotal,
          shippingFee,
          tax: 0,
          total,
        },
        discountTotalAmount: discountAmount,
        shippingTotalAmount: shippingFee,
        updatedBy: user?.did || "staff",
      };

      await apiClient.put(`/api/v1/orders/${id}`, orderPayload);

      toast.success("Order updated successfully!");
      setIsEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
      case 'paid':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-xs">Paid</Badge>;
      case 'Pending':
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 dark:text-amber-400 px-3 py-1 text-xs">Pending</Badge>;
      case 'Failed':
      case 'failed':
        return <Badge variant="destructive" className="px-3 py-1 text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 text-xs">{status}</Badge>;
    }
  };

  const getFulfillmentBadge = (status) => {
    switch (status) {
      case 'Shipped':
      case 'shipped':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-xs">Shipped</Badge>;
      case 'Processing':
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 dark:text-blue-400 px-3 py-1 text-xs">Processing</Badge>;
      case 'Cancelled':
      case 'cancelled':
        return <Badge variant="destructive" className="px-3 py-1 text-xs">Cancelled</Badge>;
      case 'Pending':
      case 'pending':
      case 'received':
        return <Badge variant="outline" className="px-3 py-1 text-xs">Pending</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 text-xs">{status}</Badge>;
    }
  };

  if (orderLoading) {
    return (
      <div className="flex-1 p-8 space-y-4">
        <div className="h-10 w-1/3 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Order Not Found</h2>
        <p className="text-muted-foreground">The order you are looking for does not exist or failed to load.</p>
        <Button onClick={() => { window.location.href = "/dashboard/orders"; }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => { window.location.href = "/dashboard/orders"; }}
            className="h-9 w-9 border-border/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Order {order.orderNumber}
              </h2>
              <div className="flex gap-1.5">
                {getFulfillmentBadge(order.orderStatus || order.status || "")}
                {getPaymentBadge(order.paymentStatus || (order.status === "completed" ? "Paid" : "Pending"))}
              </div>
            </div>
            <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Placed on {new Date(order.createdAt || order.date).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" className="gap-1.5" onClick={() => setIsEditMode(false)}>
                <Eye className="h-4 w-4" /> View Details
              </Button>
              <Button className="gap-1.5 shadow-sm" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-1 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button className="gap-1.5 shadow-sm" onClick={() => setIsEditMode(true)}>
              <Edit className="h-4 w-4" /> Edit Order
            </Button>
          )}
        </div>
      </div>

      {!isEditMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Order Items
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold text-center">Size</th>
                      <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                      <th className="px-6 py-3 font-semibold text-right">Price</th>
                      <th className="px-6 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/10">
                          <td className="px-6 py-4 font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-center">
                            {item.size ? (
                              <Badge variant="outline" className="border-primary/30 text-primary font-medium">
                                {item.size}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/60 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            {formatBDT(item.unitPrice ?? item.price ?? 0)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-primary">
                            {formatBDT(((item.unitPrice ?? item.price ?? 0) * item.quantity))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No items in this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-base border-b pb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatBDT(order.totals?.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-foreground">{formatBDT(order.totals?.shippingFee ?? order.shippingTotalAmount ?? 0)}</span>
                </div>
                {order.discountTotalAmount ? (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatBDT(order.discountTotalAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-bold pt-3 border-t border-border/85">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatBDT(order.totals?.total ?? order.totalAmount ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2 border-b pb-3">
                <User className="h-4 w-4 text-primary" />
                Customer Info
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Full Name</span>
                    <span className="font-medium text-foreground">{order.customer?.fullName || order.customerName || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="font-medium text-foreground">{order.customer?.phone || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="font-medium text-foreground">{order.customer?.email || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Address</span>
                    <span className="font-medium text-foreground">
                      {order.customer?.address || "N/A"}
                      {order.customer?.city ? `, ${order.customer.city}` : ""}
                      {order.customer?.thana ? `, ${order.customer.thana}` : ""}
                      {order.customer?.zip ? ` - ${order.customer.zip}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2 border-b pb-3">
                <CreditCard className="h-4 w-4 text-primary" />
                Method Details
              </h3>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Payment Method</span>
                  <span className="font-semibold text-foreground capitalize flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Shipping Type</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Truck className="h-4 w-4 text-primary" />
                    {(order.totals?.shippingFee ?? order.shippingTotalAmount) === 0 ? "Free Shipping" : "Flat Rate Delivery"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product Catalogue
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v ?? "All")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.did} value={cat.slug || cat.did}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={brandFilter}
                  onValueChange={(v) => setBrandFilter(v ?? "All")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.did} value={brand.slug || brand.did}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {products.map((product) => {
                    const inCart = cart.filter((c) =>
                      c.name === product.name
                    );
                    const cartQty = inCart.reduce((s, c) => s + c.quantity, 0);
                    const isOutOfStock = product.status === "Out of Stock";
                    const isVariant = product.type === "variant";
                    const displayPrice = isVariant
                      ? Math.min(
                          ...(product.variants || []).map((v) =>
                            effectivePrice(v.price, v.offerPrice ?? null),
                          ),
                        )
                      : effectivePrice(product.price, product.offerPrice ?? null);

                    return (
                      <div
                        key={product.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border bg-background transition-all
                          ${isOutOfStock ? "opacity-50" : "hover:border-primary/40 hover:shadow-sm"}
                          ${cartQty > 0 ? "border-primary/50 bg-primary/3" : "border-border"}
                        `}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative border border-border/60">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-sm leading-tight truncate">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {product.sku}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs md:text-sm font-semibold text-primary">
                              {isVariant
                                ? `from ${formatBDT(displayPrice)}`
                                : formatBDT(displayPrice)}
                            </span>
                            {isVariant && (
                              <Badge
                                variant="secondary"
                                className="text-[8px] px-1 py-0 gap-0.5 scale-90 origin-left"
                              >
                                <Layers className="h-2 w-2" />{" "}
                                {product.variants?.length ?? 0} sizes
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          {cartQty > 0 && (
                            <span className="text-[9px] font-semibold text-primary">
                              ×{cartQty}
                            </span>
                          )}
                          <button
                            disabled={isOutOfStock}
                            onClick={() =>
                              !isOutOfStock && setDialogProduct(product)
                            }
                            className={`
                              h-7 w-7 rounded-lg flex items-center justify-center transition-all
                              ${
                                isOutOfStock
                                  ? "bg-muted cursor-not-allowed text-muted-foreground"
                                  : "bg-primary text-primary-foreground hover:bg-primary/80 active:scale-95 shadow-sm"
                              }
                            `}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2 border-b pb-2">
                Customer Details
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-0.5 block">Customer Name</label>
                  <Input
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Phone Number</label>
                  <div className="flex items-center h-9 w-full rounded-lg border border-input bg-transparent overflow-hidden">
                    <span className="bg-muted/50 h-full flex items-center px-2 text-xs text-muted-foreground border-r font-medium">
                      +880
                    </span>
                    <input
                      type="text"
                      className="flex-1 h-full bg-transparent px-2 text-xs outline-none"
                      placeholder="1XXXXXXXXX"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setCustomerPhone(val);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Email</label>
                  <Input
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-0.5 block">Address</label>
                  <Input
                    placeholder="Street address details"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2 border-b pb-2">
                Order Items Cart
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs px-2 py-0">
                    {cart.reduce((s, c) => s + c.quantity, 0)} items
                  </Badge>
                )}
              </h3>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No items in the order cart</p>
                  <p className="text-[10px] mt-1">Select from the catalogue to add items</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 border-b pb-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <p className="text-[11px] font-semibold text-foreground truncate max-w-[160px]">
                            {item.name}
                          </p>
                          {item.size ? (
                            <Badge variant="outline" className="text-[8px] border-primary/20 text-primary py-0 px-1 h-3.5 flex items-center font-medium">
                              {item.size}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {formatBDT(item.price)} × {item.quantity} ={" "}
                          <span className="font-semibold text-foreground">
                            {formatBDT(item.price * item.quantity)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="h-5 w-5 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-2 w-2" />
                        </button>
                        <span className="w-4 text-center text-[10px] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="h-5 w-5 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-2 w-2" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="h-5 w-5 rounded flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-0.5"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-4 pt-1 space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <div className="flex justify-end">
                      <Input
                        type="number"
                        className="w-24 text-right h-7 px-2 text-xs"
                        value={shippingFee}
                        min={0}
                        onChange={(e) => setShippingFee(Number(e.target.value || 0))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <span className="text-muted-foreground">Discount</span>
                    <div className="flex justify-end">
                      <Input
                        type="number"
                        className="w-24 text-right h-7 px-2 text-xs"
                        value={discountAmount}
                        min={0}
                        onChange={(e) => setDiscountAmount(Number(e.target.value || 0))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm md:text-base font-bold mt-2 pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatBDT(total)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2 border-b pb-2">
                Order Status Update
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-muted-foreground mb-1 block">Fulfillment Status</label>
                  <Select value={orderStatus} onValueChange={(val) => setorderStatus(val ?? "Pending")}>
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Select Fulfillment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val ?? "cash")}>
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductAddDialog
        product={dialogProduct}
        onClose={() => setDialogProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
