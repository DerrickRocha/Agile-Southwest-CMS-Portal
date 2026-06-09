export interface Order {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    customerId: number;
    customerFirstName: string;
    customerLastName: string;
    totalAmount: number;
    orderDate: string;
}