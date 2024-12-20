import {
    createBrowserRouter,
    RouteObject,
    RouterProvider,
} from "react-router";
import { Home } from "../Pages/Home";

function Router() {
    const routes: RouteObject[] = [
        {
            path: "/",
            element: <Home />,
        },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
