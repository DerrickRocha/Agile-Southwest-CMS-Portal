import {Container, Nav, Navbar} from "react-bootstrap";
import {type LoaderFunctionArgs, NavLink, Outlet, useLoaderData} from "react-router";

interface TenantConsoleLoaderData {
    tenantId: string;
    tenantName: string;
    tenant?: {
        id: string;
        name: string;
        subDomain?: string;
        customDomain?: string;
    };
    error?: string;
}

export async function tenantConsoleLoader({ params }: LoaderFunctionArgs){
    const tenantId = params.tenantId;
    console.log('Tenant ID:', tenantId);
    if (!tenantId) {
        return { error: 'Tenant ID is required' };
    }
    localStorage.setItem('tenantId', tenantId);
    return {
        tenantId,
        tenantName: `Tenant ${tenantId}`,
    };
}

export function TenantConsole() {
    const data = useLoaderData() as TenantConsoleLoaderData;
    const basePath = `/console/${data.tenantId}`;
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink
                                to={`${basePath}/orders`}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                            >
                                Orders
                            </NavLink>
                            <NavLink
                                to={`${basePath}/inventory`}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                            >
                                Inventory
                            </NavLink>
                            <NavLink
                                to={`${basePath}/customers`}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                            >
                                Customers
                            </NavLink>
                            <NavLink
                                to={`${basePath}/settings`}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                            >
                                Settings
                            </NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Outlet/>
        </>
    )
}