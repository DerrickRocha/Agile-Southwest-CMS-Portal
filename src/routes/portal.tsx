import {Button, Col, Container, Row} from "react-bootstrap";
import {Outlet, useNavigate} from "react-router";

export function PortalScreen() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1>ASW CMS Portal</h1>
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                    <hr />
                    <p>Welcome back, User</p>
                    <Outlet/>
                </Col>
            </Row>
        </Container>
    );
}