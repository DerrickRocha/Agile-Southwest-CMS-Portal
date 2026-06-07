import {Alert, ListGroup} from "react-bootstrap";
import {Link, redirect, useLoaderData} from "react-router";

interface Tenant {
    tenantId: number;
    name: string;
    subDomain: string;
    customDomain: string;
    rowVersion: string;
}

export const companiesLoader = async () => {
    try{
        const response = await fetch('http://localhost:5100/tenants/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            },
        });
        if (!response.ok) {
            console.log(response);
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('idToken');
                localStorage.removeItem('refreshToken');
                return redirect('/login');
            }
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.message || 'Error fetching companies' };
        }
        const data = await response.json();
        console.log(data);
        return { tenants: data };
    }
    catch (error) {
        return { error: 'Network error - could not connect to server' };
    }
}

export function Companies() {
    const data = useLoaderData() as { tenants: Tenant[] } | { error: string };
    if ('error' in data) {
        return <Alert variant="danger">{data.error}</Alert>;
    }

    if (!data.tenants?.length) {
        return <p>No companies available.</p>;
    }
    return (
        <>
            <h2>Please select a company to work with</h2>

            <ListGroup>
                {
                    data?.tenants.map(tenant => (
                        <ListGroup.Item
                            key={tenant.tenantId}
                            as={Link}  // Render as React Router Link
                            to={`/console/${tenant.tenantId}`}  // Navigate to company-specific route
                            action
                        >{tenant.name}</ListGroup.Item>
                    ))
                }
            </ListGroup>
        </>
    )
}