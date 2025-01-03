import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { Home } from "../Pages/Home";
import { Vehicules } from "../Pages/Vehicules";
import { routePath } from "./routeConstants";
import PrivateRoute from "./privatesRoutes";
import { Verifications } from "../Pages/Verifications";

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
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
