import type {LoaderFunctionArgs} from "react-router";
import type {Order} from "../models/order.ts";

interface OrderDetailsLoaderData {
    tenantId: string;
    order: Order;
    error?: string;
}
export function ordersDetailsLoader({ params }: LoaderFunctionArgs) {

}

export function OrderDetails() {
    return (<>Order Details</>)
}