import type {LoaderFunctionArgs} from "react-router";
import type {Order} from "../models/order.ts";

interface OrderDetailsLoaderData {
    tenantId: string;
    order: Order;
    error?: string;
}
export function ordersDetailsLoader({ params }: LoaderFunctionArgs) {
    const {tenantId, orderId} = params;
    if (!tenantId) {
        throw new Response('Tenant ID required', {status: 400});
    }
}

export function OrderDetails() {
    return (<>Order Details</>)
}