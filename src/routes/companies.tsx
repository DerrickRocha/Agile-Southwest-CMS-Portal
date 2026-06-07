import {Alert, ListGroup} from "react-bootstrap";
import {Link, useLoaderData} from "react-router";
import {networkManager} from "../api/networkManager.ts";

interface Tenant {
    tenantId: number;
    name: string;
    subDomain: string;
    customDomain: string;
    rowVersion: string;
}

export const companiesLoader = async () => {
    try{

        const data = await networkManager.get<Tenant[]>('/tenants/all');
        return { tenants: data };
    }
    catch (error) {
        console.error('Error fetching companies:', error);
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