import {type LoaderFunctionArgs, useLoaderData, useNavigate, useRouteError} from "react-router";
import type {Product} from "../models/product.ts";
import {networkManager} from "../api/networkManager.ts";
import {Badge, Button, Card, Col, Form, Row, Table, Image, Pagination} from "react-bootstrap";
import {useState} from "react";
import type {ProductOption} from "../models/productOption.ts";
import type {ProductOptionChoice} from "../models/productOptionChoice.ts";

interface GetProductsResponse {
    items: Product[];
    page: number;
    pageSize: number;
    totalCount: number;
}

interface ProductsScreenLoaderData {
    tenantId: string;
    products: Product[];
    page: number;
    pageSize: number;
    totalCount: number;
}

export async function productsScreenLoader({ params, request }: LoaderFunctionArgs) {
    const { tenantId } = params;

    if (!tenantId) {
        throw new Response('Tenant ID required', { status: 400 });
    }

    // Parse URL for pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    try {
        const response = await networkManager.get<GetProductsResponse>(`/products?page=${page}&pageSize=${pageSize}`);

        return {
            tenantId,
            products: response.items,
            page: response.page,
            pageSize: response.pageSize,
            totalCount: response.totalCount
        } as ProductsScreenLoaderData;
    } catch (error) {
        console.error(`Failed to fetch products for tenant ${tenantId}:`, error);
        throw new Response('Failed to load products', { status: 500 });
    }
}

export function ProductsScreen() {
    const { tenantId, products, page, pageSize, totalCount } = useLoaderData() as ProductsScreenLoaderData;
    const navigate = useNavigate();
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);

    // Filter products (client-side filtering)
    const filteredProducts = products.filter(product => {
        // Filter by active status
        if (!showInactive && !product.isActive) return false;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return product.name.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term);
        }

        return true;
    });

    const activeProductsCount = products.filter(p => p.isActive).length;
    const inactiveProductsCount = products.filter(p => !p.isActive).length;

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (newPage: number) => {
        navigate(`/console/${tenantId}/products?page=${newPage}&pageSize=${pageSize}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        navigate(`/console/${tenantId}/products?page=1&pageSize=${newPageSize}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const ProductDetailModal = () => {
        if (!selectedProduct) return null;

        return (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowProductModal(false)}>
                <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{selectedProduct.name}</h5>
                            <Button variant="close" onClick={() => setShowProductModal(false)} />
                        </div>
                        <div className="modal-body">
                            <Row>
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <Col md={4}>
                                        <Image
                                            src={selectedProduct.images[0].url}
                                            thumbnail
                                            alt={selectedProduct.name}
                                        />
                                    </Col>
                                )}
                                <Col md={selectedProduct.images?.length ? 8 : 12}>
                                    <p><strong>Description:</strong> {selectedProduct.description}</p>
                                    <p><strong>Base Price:</strong> {formatPrice(selectedProduct.basePrice)}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <Badge bg={selectedProduct.isActive ? 'success' : 'secondary'}>
                                            {selectedProduct.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </p>
                                </Col>
                            </Row>

                            {selectedProduct.options && selectedProduct.options.length > 0 && (
                                <>
                                    <hr />
                                    <h6>Product Options</h6>
                                    {selectedProduct.options.map((option: ProductOption) => (
                                        <Card key={option.id} className="mb-2">
                                            <Card.Body>
                                                <Card.Title>
                                                    {option.name}
                                                    {option.isRequired && <Badge bg="info" className="ms-2">Required</Badge>}
                                                </Card.Title>
                                                <ul className="mb-0">
                                                    {option.choices.map((choice: ProductOptionChoice) => (
                                                        <li key={choice.id}>
                                                            {choice.name}
                                                            {choice.priceDelta !== 0 && (
                                                                <span className="text-muted ms-2">
                                                                    (+{formatPrice(choice.priceDelta)})
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowProductModal(false)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate(`/console/${tenantId}/products/${selectedProduct.id}`)}
                            >
                                Edit Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Pagination component
    const PaginationComponent = () => {
        const items = [];
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return (
            <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                {items}
                <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
        );
    };

    return (
        <>
            {showProductModal && <ProductDetailModal />}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Products</h1>
                <Button variant="primary" onClick={() => navigate(`/console/${tenantId}/products/new`)}>
                    Add New Product
                </Button>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Products</Card.Title>
                            <h2>{totalCount}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Active Products</Card.Title>
                            <h2 className="text-success">{activeProductsCount}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Inactive Products</Card.Title>
                            <h2 className="text-secondary">{inactiveProductsCount}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Search Products</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Status Filter</Form.Label>
                                <Form.Select
                                    value={showInactive ? "all" : "active"}
                                    onChange={(e) => setShowInactive(e.target.value === "all")}
                                >
                                    <option value="active">Active Only</option>
                                    <option value="all">All (Active & Inactive)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Items per page</Form.Label>
                                <Form.Select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Products Table */}
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Base Price</th>
                    <th>Options</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center">
                            No products found
                        </td>
                    </tr>
                ) : (
                    filteredProducts.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <strong>{product.name}</strong>
                                {product.images && product.images.length > 0 && (
                                    <div className="mt-1">
                                        <Image
                                            src={product.images[0].url}
                                            width={40}
                                            height={40}
                                            thumbnail
                                            alt={product.name}
                                        />
                                    </div>
                                )}
                            </td>
                            <td>
                                {product.description.length > 100
                                    ? `${product.description.substring(0, 100)}...`
                                    : product.description}
                            </td>
                            <td>{formatPrice(product.basePrice)}</td>
                            <td>
                                {product.options && product.options.length > 0 ? (
                                    <Badge bg="info">
                                        {product.options.length} option{product.options.length !== 1 ? 's' : ''}
                                    </Badge>
                                ) : (
                                    <Badge bg="secondary">No options</Badge>
                                )}
                            </td>
                            <td>
                                <Badge bg={product.isActive ? 'success' : 'danger'}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowProductModal(true);
                                        }}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => navigate(`/console/${tenantId}/products/${product.id}`)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} products
                    </div>
                    <PaginationComponent />
                </div>
            )}
        </>
    );
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