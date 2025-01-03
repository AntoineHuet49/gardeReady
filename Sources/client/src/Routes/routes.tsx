import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { Home } from "../Pages/Home";
import { Vehicules } from "../Pages/Vehicules";
import { routePath } from "./routeConstants";

function Router() {
    const routes: RouteObject[] = [
        {
            path: routePath.home,
            element: <Home />,
        },
        {
            path: routePath.vehicules,
            element: <Vehicules />,
        },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
