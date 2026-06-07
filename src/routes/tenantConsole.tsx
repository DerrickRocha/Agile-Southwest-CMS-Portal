import {Container, Nav, Navbar} from "react-bootstrap";

export function tenantConsoleLoader() {

}

export function TenantConsole() {
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#orders">Orders</Nav.Link>
                            <Nav.Link href="#inventory">Inventory</Nav.Link>
                            <Nav.Link href="#customers">Customers</Nav.Link>
                            <Nav.Link href="#settings">Settings</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}