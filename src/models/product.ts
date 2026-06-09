import type {ProductOption} from "./productOption.ts";
import type {Image} from "./Image.ts";

export interface Product {
    id: number,
    tenantId: number,
    name: string,
    description: string,
    basePrice: number,
    isActive: boolean,
    options: ProductOption[],
    images: Image[],
}