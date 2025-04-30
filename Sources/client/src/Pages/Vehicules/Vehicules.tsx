import { NavigateFunction } from "react-router";
import Alert from "../../Components/Alert/Alert";
import Card from "../../Components/Card/Card";
import Loader from "../../Components/Loader/Loader";
import { Vehicule } from "../../Types/Vehicule";
import { routePath } from "../../Routes/routeConstants";
import Button from "../../Components/Button/button";

type VehiculesProps = {
    vehicules: Vehicule[];
    isLoading: boolean;
    error: Error | null;
    navigate: NavigateFunction;
    actualLocation: string;
};

function Vehicules({
    vehicules,
    isLoading,
    error,
    navigate,
    actualLocation,
}: VehiculesProps) {
    return (
        <div className="container flex flex-col items-center p-4">
            {actualLocation !== routePath.admin && (
                <Button
                    onClick={() => navigate(routePath.admin)}
                    text="Tableau de bord"
                />
            )}
            <h1 className="text-6xl m-10">Véhicules</h1>
            {isLoading ? <Loader /> : undefined}
            {!error ? (
                <div className="flex flex-wrap justify-center w-full p-6">
                    {vehicules.map((vehicule) => (
                        <Card
                            key={vehicule.id}
                            name={vehicule.name}
                            onClick={() =>
                                navigate(
                                    routePath.details.replace(
                                        ":id",
                                        vehicule.id.toString()
                                    )
                                )
                            }
                        />
                    ))}
                </div>
            ) : (
                <Alert
                    type="error"
                    display={true}
                    message="Aucun vehicule n'a été trouvé"
                />
            )}
        </div>
    );
}

export default Vehicules;
