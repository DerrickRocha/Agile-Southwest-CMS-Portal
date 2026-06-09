export interface ProductOptionChoice {
    id: number,
    productId: number,
    optionId: number,
    name: string,
    priceDelta: number,
    salePriceDelta: number,
    isActive: boolean,
}