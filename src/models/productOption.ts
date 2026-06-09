import type {ProductOptionChoice} from "./productOptionChoice.ts";

export interface ProductOption {
    id: number,
    productId: number,
    name: string,
    isRequired: boolean,
    choices: ProductOptionChoice[],
}