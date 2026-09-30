import { NavigateFunction } from "react-router";
import Alert from "../../Components/Alert/Alert";
import Card from "../../Components/Card/Card";
import Loader from "../../Components/Loader/Loader";
import { Vehicule } from "../../Types/Vehicule";
import { routePath } from "../../App/Routes/routeConstants";
import { PRISE_DE_GARDE_HOUR } from "../../App/utils/planning";

type VehiculesProps = {
    vehicules: Vehicule[];
    assignedIds: Set<number>;
    currentShift: Date;
    isLoading: boolean;
    error: Error | null;
    navigate: NavigateFunction;
};

function Vehicules({
    vehicules,
    assignedIds,
    currentShift,
    isLoading,
    error,
    navigate,
}: VehiculesProps) {
    // Les véhicules assignés à l'agent pour sa prise de garde passent en premier
    const sorted = [...vehicules].sort((a, b) => Number(assignedIds.has(b.id)) - Number(assignedIds.has(a.id)));
    const assigned = vehicules.filter((v) => assignedIds.has(v.id));
    const shiftDay = currentShift.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    return (
        <div className="container flex flex-col items-center p-4">
            {isLoading ? <Loader /> : undefined}
            {!error ? (
                <>
                    {assigned.length > 0 && (
                        <div role="status" className="alert alert-info w-full max-w-3xl">
                            <span>
                                À vérifier pour ta prise de garde ({shiftDay} {PRISE_DE_GARDE_HOUR}h) :{" "}
                                <strong>{assigned.map((v) => v.name).join(", ")}</strong>
                            </span>
                        </div>
                    )}
                    <div className="flex flex-wrap justify-center w-full p-6">
                        {!isLoading && vehicules.length === 0 && (
                            <p className="text-center text-base-content/70 py-8">
                                Aucun véhicule n'est configuré pour le moment.
                            </p>
                        )}
                        {sorted.map((vehicule) => (
                            <Card
                                key={vehicule.id}
                                name={vehicule.name}
                                highlighted={assignedIds.has(vehicule.id)}
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
                </>
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
