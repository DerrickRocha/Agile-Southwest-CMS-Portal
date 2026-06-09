import {type LoaderFunctionArgs, useLoaderData, useNavigate, useRouteError} from "react-router";
import type {Order} from "../models/order.ts";
import {networkManager} from "../api/networkManager.ts";
import {Alert, Badge, Button, Card, Col, Form, Row, Table} from "react-bootstrap";
import {useState} from "react";

interface OrderDetailsLoaderData {
    tenantId: string;
    order: Order;
}
export async function ordersDetailsLoader({ params }: LoaderFunctionArgs) {
    const {tenantId, orderId} = params;
    if (!tenantId) {
        throw new Response('Tenant ID required', {status: 400});
    }
    if (!orderId) {
        throw new Response('Order ID required', {status: 400});
    }

    try {
        const order = await networkManager.get<Order>(`/orders/${orderId}`);
        return { tenantId, order } as OrderDetailsLoaderData;
    } catch (error) {
        console.error(`Failed to fetch order ${orderId} for tenant ${tenantId}:`, error);
        throw new Response('Failed to load order details', { status: 500 });
    }
}

export function OrderDetails() {
    const { tenantId, order } = useLoaderData() as OrderDetailsLoaderData;
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [status, setStatus] = useState(order.status);
    const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
    const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);
    const [reason, setReason] = useState("");

    const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    const paymentStatusOptions = ['Unpaid', 'Paid', 'Processing', 'PartiallyPaid', 'Failed', 'PaymentExpired', 'Refunded', 'PartialRefunded'];
    const fulfillmentStatusOptions = ['Unfulfilled', 'Partial', 'Fulfilled'];

    const getStatusVariant = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
            case 'fulfilled':
                return 'success';
            case 'pending':
            case 'processing':
                return 'warning';
            case 'cancelled':
            case 'failed':
            case 'paymentexpired':
                return 'danger';
            case 'confirmed':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updateData: { status: string; paymentStatus: string; fulfillmentStatus: string; reason?: string } = {
                status,
                paymentStatus,
                fulfillmentStatus
            };

            if (reason) {
                updateData.reason = reason;
            }

            await networkManager.patch(`/orders/${order.id}/status`, updateData);

            setSuccess('Order updated successfully');
            setIsEditing(false);
            setReason("");

            // Refresh the page to show updated data
            setTimeout(() => {
                navigate(`/console/${tenantId}/orders/${order.id}`, { replace: true });
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setStatus(order.status);
        setPaymentStatus(order.paymentStatus);
        setFulfillmentStatus(order.fulfillmentStatus);
        setReason("");
        setError(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Order Details: {order.orderNumber}</h1>
                {!isEditing && (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Edit Order
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    <Alert.Heading>Success!</Alert.Heading>
                    <p>{success}</p>
                </Alert>
            )}

            <Card className="mb-4">
                <Card.Header as="h5">Order Information</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Table borderless>
                                <tbody>
                                <tr>
                                    <th style={{ width: '150px' }}>Order Number:</th>
                                    <td>{order.orderNumber}</td>
                                </tr>
                                <tr>
                                    <th>Order Date:</th>
                                    <td>{formatDate(order.createdAt)}</td>
                                </tr>
                                <tr>
                                    <th>Customer:</th>
                                    <td>{order.customerFirstName} {order.customerLastName} (ID: {order.customerId})</td>
                                </tr>
                                <tr>
                                    <th>Total Amount:</th>
                                    <td><strong>${(order.totalCents/100).toFixed(2)}</strong></td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                        <Col md={6}>
                            <Table borderless>
                                <tbody>
                                <tr>
                                    <th style={{ width: '150px' }}>Status:</th>
                                    <td>
                                        {isEditing ? (
                                            <Form.Select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <Badge bg={getStatusVariant(status)}>
                                                {status}
                                            </Badge>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Payment Status:</th>
                                    <td>
                                        {isEditing ? (
                                            <Form.Select
                                                value={paymentStatus}
                                                onChange={(e) => setPaymentStatus(e.target.value)}
                                            >
                                                {paymentStatusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <Badge bg={getStatusVariant(paymentStatus)}>
                                                {paymentStatus}
                                            </Badge>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Fulfillment Status:</th>
                                    <td>
                                        {isEditing ? (
                                            <Form.Select
                                                value={fulfillmentStatus}
                                                onChange={(e) => setFulfillmentStatus(e.target.value)}
                                            >
                                                {fulfillmentStatusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <Badge bg={getStatusVariant(fulfillmentStatus)}>
                                                {fulfillmentStatus}
                                            </Badge>
                                        )}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    {isEditing && (
                        <>
                            <hr />
                            <Form.Group className="mb-3">
                                <Form.Label>Reason for Update (Optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a reason for these changes..."
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleUpdate}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Save Changes'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <Button variant="outline-secondary" onClick={() => navigate(`/console/${tenantId}/orders`)}>
                ← Back to Orders
            </Button>
        </>
    );
}

export function OrderDetailsErrorBoundary() {
    const error = useRouteError();
    let message = 'Unknown error';

    if (error instanceof Error) message = error.message;
    else if (typeof error === 'object' && error !== null && 'statusText' in error)
        message = String(error.statusText);
    else if (typeof error === 'string') message = error;

    return (
        <div role="alert">
            <h2>Error Loading Order</h2>
            <p>{message}</p>
            <Button variant="primary" onClick={() => window.history.back()}>
                Go Back
            </Button>
        </div>
    );
}