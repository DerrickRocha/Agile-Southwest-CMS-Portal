import {Alert, Button, Col, Container, Modal, Row, Spinner} from "react-bootstrap";
import {type ActionFunctionArgs, redirect, Form, useActionData, useNavigation} from "react-router";
import {networkManager} from "../api/networkManager.ts";

interface AuthResponse {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn?: number;
}

export async function loginAction({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {

        const data: AuthResponse = await networkManager.post<AuthResponse>('/auth/login', {email, password}, {
            includeAuth: false,
            requireTenant: false
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('idToken', data.idToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return redirect('/');

    } catch (error) {
        return {error: 'Network error - could not connect to server'};
    }
}

export function Login() {
    const actionData = useActionData() as { error?: string } | undefined;
    const navigation = useNavigation();
    const isLoading = navigation.state === 'submitting';
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center min-vh-100 login-screen">
                <Row>
                    <Col>
                        <Logo/>
                        <Form method="post">
                            <div className="mb-3">
                                <label className="form-label">Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="w-100"
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>

                            {actionData?.error && (
                                <Alert variant="danger" className="mt-3">
                                    {actionData.error}
                                </Alert>
                            )}
                        </Form>
                    </Col>
                </Row>
            </Container>
            {isLoading && <OverlayLoadingScreen/>}
        </>
    );
}

function Logo() {
    return <img className="m-4" src="/logo.png" alt="ASW CMS Logo"/>
}

function OverlayLoadingScreen() {
    return (
        <Modal
            show={true}
            backdrop="static"
            keyboard={false}
            centered
            size="sm"
        >
            <Modal.Body className="text-center">
                <Spinner animation="border" variant="primary"/>
                <p className="mt-2 mb-0">Loading...</p>
            </Modal.Body>
        </Modal>
    );
}