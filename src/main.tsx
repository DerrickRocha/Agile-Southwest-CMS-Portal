import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import {createBrowserRouter, redirect, RouterProvider} from "react-router";
import {Login, loginAction} from "./routes/login.tsx";
import {PortalScreen} from "./routes/portal.tsx";
import {Companies} from "./routes/companies.tsx";

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
                        Component: Companies
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