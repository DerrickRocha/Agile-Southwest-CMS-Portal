import {networkManager} from "../api/networkManager.ts";
import {Link, type LoaderFunctionArgs, useLoaderData} from "react-router";
import {ListGroup} from "react-bootstrap";
import type {Order} from "../models/order.ts";

interface OrdersLoaderData {
    tenantId: string;
    orders: Order[];
    error?: string;
}

export async function ordersLoader({ params }: LoaderFunctionArgs) {
    const tenantId = params.tenantId;
    const orders = await networkManager.get<Order[]>('/orders')
    return {
        tenantId,
        orders
    } as OrdersLoaderData;
}
export function Orders() {
    const data = useLoaderData() as OrdersLoaderData;
    const basePath = `/console/${data.tenantId}/orders`;
    if ('error' in data) {
        return <p>{data.error}</p>;
    }
    return (
        <>
            <h1>Orders</h1>

            <ListGroup>
                {
                    data?.orders.map(order => (
                        <ListGroup.Item
                            key={order.id}
                            as={Link}
                            to={`${basePath}/${order.id}`}
                            action
                        >{order.status}</ListGroup.Item>
                    ))
                }
            </ListGroup>
        </>


    )
}