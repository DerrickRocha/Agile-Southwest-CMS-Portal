import {networkManager} from "../api/networkManager.ts";
import {Link, type LoaderFunctionArgs, useLoaderData, useRouteError} from "react-router";
import {Table} from "react-bootstrap";
import type {Order} from "../models/order.ts";

interface OrdersLoaderData {
    tenantId: string;
    orders: Order[];
}

export async function ordersLoader({params}: LoaderFunctionArgs) {
    const {tenantId} = params;

    if (!tenantId) {
        throw new Response('Tenant ID required', {status: 400});
    }

    try {
        const orders = await networkManager.get<Order[]>(`/orders`);
        return { tenantId, orders } as OrdersLoaderData;
    } catch (error) {
        console.error(`Failed to fetch orders for tenant ${tenantId}:`, error);
        throw new Response('Failed to load orders', { status: 500 });
    }
}

export function Orders() {
    const data = useLoaderData() as OrdersLoaderData;
    const basePath = `/console/${data.tenantId}/orders`;
    if (!data.orders?.length) {
        return <p>No orders found</p>;
    }
    return (
        <>
            <h1>Orders ({data.orders.length})</h1>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Order Date</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {
                    data.orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.orderNumber}</td>
                            <td>{order.customerFirstName} {order.customerLastName}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>{order.status}</td>
                            <td>
                                <Link to={`${basePath}/${order.id}`}>
                                    View Order
                                </Link>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>

        </>
    )
}

export function OrdersErrorBoundary() {
    const error = useRouteError();

    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'statusText' in error) {
        errorMessage = String(error.statusText);
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return (
        <div role="alert">
            <p>Error loading orders: {errorMessage}</p>
        </div>
    );
}