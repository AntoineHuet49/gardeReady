import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { routePath } from "./routeConstants";
import PrivateRoute from "./privatesRoutes";
import { Home } from "../../Pages/Home";
import { Vehicules } from "../../Pages/Vehicules";
import { Verifications } from "../../Pages/Verifications";
import { Admin } from "../../Pages/Admin";
import AdminRoutes from "./adminRoutes";
import AppLayout from "../../Components/Layout/AppLayout";

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
                    <AppLayout title="Véhicules">
                        <Vehicules />
                    </AppLayout>
                </PrivateRoute>
            ),
        },
        {
            path: routePath.details,
            element: (
                <PrivateRoute>
                    <AppLayout title="Vérifications">
                        <Verifications />
                    </AppLayout>
                </PrivateRoute>
            ),
        },
        {
            path: routePath.admin,
            element: (
                <PrivateRoute>
                    <AdminRoutes>
                        <AppLayout title="Tableau de bord">
                            <Admin />
                        </AppLayout>
                    </AdminRoutes>
                </PrivateRoute>
            ),
        },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
