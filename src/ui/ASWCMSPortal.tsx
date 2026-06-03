import {Button, Col, Container, Form, Modal, Row, Spinner} from "react-bootstrap";
import {useState} from "react";

interface LoginProps {
    email: string;
    password: string;
    errorMsg: string | null;
    isLoading: boolean;
}

export function ASWCMSPortal() {
    const props = {isLoggedIn: false};
    return (
        <>
            {props.isLoggedIn ? <PortalScreen/> : <LoginScreen/>}
        </>
    )
}

function LoginScreen() {

    const [login, setLogin] = useState<LoginProps>({email: "", password: "", errorMsg: null, isLoading: false});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLogin({...login, isLoading: true});
    }

    return (
        <LoginSection props={login} setLogin={setLogin} handleSubmit={handleSubmit}/>
    );
}

function LoginSection(
    {
        props,
        setLogin,
        handleSubmit
    }: {
        props: LoginProps;
        setLogin: (value: LoginProps) => void;
        handleSubmit: (e: React.SubmitEvent) => void;
    }
) {
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center min-vh-100 login-screen">
                <Row>
                    <Col>
                        <Logo/>
                        <Form className="login-form" onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" placeholder="Enter email" value={props.email}
                                              onChange={(e) => setLogin({...props, email: e.target.value})}/>
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone else.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password"/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label="Check me out"/>
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                            {props.errorMsg && <p className="text-danger">{props.errorMsg}</p>}
                            <p className="mt-3">
                                Don't have an account? <a href="#">Sign Up</a>
                            </p>
                        </Form>
                    </Col>
                </Row>
            </Container>
            {props.isLoading && <OverlayLoadingScreen/>}
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
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0">Loading...</p>
            </Modal.Body>
        </Modal>
    );
}

function PortalScreen() {
    return <>
        <h1>Jews will not replaces us</h1>
    </>
}