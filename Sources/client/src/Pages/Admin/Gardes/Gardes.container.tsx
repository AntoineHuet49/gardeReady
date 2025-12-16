import Gardes from "./Gardes";
import { useGardes } from "../../../hooks/useGardes";

function GardesContainer() {
    const { gardes, isLoading, error } = useGardes();

    return <Gardes gardes={gardes} isLoading={isLoading} error={error} />;
}

export default GardesContainer;
