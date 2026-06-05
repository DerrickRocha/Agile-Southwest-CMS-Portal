import {Alert, Button, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {type ActionFunctionArgs, Link, redirect, useActionData, useNavigation} from "react-router";

export async function registerAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    try {
        const response = await fetch('http://localhost:5100/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.message || 'Registration failed' };
        }

        // Redirect to login on success
        return redirect('/login?registered=true');

    } catch (error) {
        return { error: 'Network error - could not connect to server' };
    }
}

export function RegisterScreen() {
    const actionData = useActionData() as { error?: string } | undefined;
    const navigation = useNavigation();
    const isLoading = navigation.state === 'submitting';

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row className="w-100" style={{ maxWidth: '400px' }}>
                <Col>
                    <h2 className="text-center mb-4">Create Account</h2>

                    <Form method="post">
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary" disabled={isLoading} className="w-100">
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Creating account...</span>
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>

                        {actionData?.error && (
                            <Alert variant="danger" className="mt-3">
                                {actionData.error}
                            </Alert>
                        )}

                        <p className="mt-3 text-center">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}