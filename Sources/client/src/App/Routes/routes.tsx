import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { routePath } from "./routeConstants";
import PrivateRoute from "./privatesRoutes";
import { Home } from "../../Pages/Home";
import { Vehicules } from "../../Pages/Vehicules";
import { Verifications } from "../../Pages/Verifications";
import { Admin } from "../../Pages/Admin";

function Router() {
    const routes: RouteObject[] = [
        {
            path: routePath.home,
            element: <Home />,
        },
        {
            path: routePath.vehicules,
            element: (
                <PrivateRoute>
                    <Vehicules />
                </PrivateRoute>
            ),
        },
        {
            path: routePath.details,
            element: (
                <PrivateRoute>
                    <Verifications />
                </PrivateRoute>
            ),
        },
        {
            path: routePath.admin,
            element: (
                <PrivateRoute>
                    <Admin />
                </PrivateRoute>
            ),
        },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
