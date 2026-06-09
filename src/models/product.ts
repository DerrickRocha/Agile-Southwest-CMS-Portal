import type {ProductOption} from "./productOption.ts";
import type {Image} from "./Image.ts";

export interface Product {
    id: number,
    tenantId: number,
    name: string,
    description: string,
    basePrice: number,
    isActive: boolean,
    stock: number
    options: ProductOption[],
    images: Image[],
}