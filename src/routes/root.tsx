import {Outlet} from "react-router";

export function Root() {
    // Check if user is logged in from localStorage

    return (
        <>
            <Outlet />
        </>
    );
}