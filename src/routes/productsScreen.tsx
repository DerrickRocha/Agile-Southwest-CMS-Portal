import {type LoaderFunctionArgs, useRouteError} from "react-router";
import type {Product} from "../models/product.ts";
import {networkManager} from "../api/networkManager.ts";
import {Button} from "react-bootstrap";

interface ProductsScreenLoaderData {
    tenantId: string;
    products: Product[];
}

export async function productsScreenLoader({params}: LoaderFunctionArgs) {
    const {tenantId} = params;
    if (!tenantId) {
        throw new Response('Tenant ID required', {status: 400});
    }

    try {
        const products = await networkManager.get<Product[]>('/products');
        return { tenantId, products: products } as ProductsScreenLoaderData;
    } catch (error) {
        console.error(`Failed to fetch products for tenant ${tenantId}:`, error);
        throw new Response('Failed to load products', { status: 500 });
    }
}

export function ProductsScreen() {
    return (
        <div>
            <h1>Products</h1>
        </div>
    )
}

export function ProductsScreenErrorBoundary() {
    const error = useRouteError();
    let message = 'Unknown error';

    if (error instanceof Error) message = error.message;
    else if (typeof error === 'object' && error !== null && 'statusText' in error)
        message = String(error.statusText);
    else if (typeof error === 'string') message = error;

    return (
        <div role="alert">
            <h2>Error Loading Products</h2>
            <p>{message}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
            </Button>
        </div>
    );
}