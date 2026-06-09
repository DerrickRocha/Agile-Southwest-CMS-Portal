import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import {createBrowserRouter, Navigate, redirect, RouterProvider} from "react-router";
import {Login, loginAction} from "./routes/login.tsx";
import {PortalScreen} from "./routes/portal.tsx";
import {Companies, companiesLoader} from "./routes/companies.tsx";
import {TenantConsole, tenantConsoleLoader} from "./routes/tenantConsole.tsx";
import {Orders, ordersLoader} from "./routes/orders.tsx";
import {OrderDetails} from "./routes/orderDetails.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                path: "",
                Component: PortalScreen,
                middleware: [authMiddleware],
                children: [
                    {
                        index: true,
                        Component: Companies,
                        loader: companiesLoader,
                    },
                    {
                        path: "console/:tenantId",
                        Component: TenantConsole,
                        loader: tenantConsoleLoader,
                        children: [
                            {
                                index: true,  // Default view when no child route matches
                                element: <Navigate to="orders" replace />,
                            },
                            {
                                path: "orders",  // Relative: /console/:tenantId/orders
                                Component: Orders,
                                loader: ordersLoader,
                            },
                            {
                                path: "orders/:orderId",
                                Component: OrderDetails,
                                loader: ordersLoader
                            }
                            /*{
                                path: "inventory",  // Relative: /console/:tenantId/inventory
                                Component: Inventory,
                            },
                            {
                                path: "customers",  // Relative: /console/:tenantId/customers
                                Component: Customers,
                            },
                            {
                                path: "settings",  // Relative: /console/:tenantId/settings
                                Component: Settings,
                            }*/
                        ]
                    }
                ]
            }, {
                path: "login",
                action: loginAction,
                Component: Login,
            }
        ],
    },
]);

async function authMiddleware() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw redirect("/login")
    }
}
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)