import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { Home } from "../Pages/Home";
import { Vehicules } from "../Pages/Vehicules";
import { routePath } from "./routeConstants";
import PrivateRoute from "./privatesRoutes";
import { Verifications } from "../Pages/Verifications";
import AdminRoutes from "./adminRoutes";
import { Admin } from "../Pages/Admin";

function Router() {
    const routes: RouteObject[] = [
        {
            path: routePath.home,
            element: <Home />,
        },
        {
            path: routePath.vehicules,
            element: <PrivateRoute Component={Vehicules} />,
        },
        {
            path: routePath.details,
            element: <PrivateRoute Component={Verifications} />,
        },
        {
            path: routePath.admin,
            element: <AdminRoutes Component={Admin} />,
        }
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
