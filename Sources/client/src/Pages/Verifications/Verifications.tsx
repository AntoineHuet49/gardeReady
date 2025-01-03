import Alert from "../../Components/Alert/Alert";
import RadioInput from "../../Components/Input/RadioInput";
import Loader from "../../Components/Loader/Loader";
import { Element } from "../../Types/Element";
import { Vehicule } from "../../Types/Vehicule";

type DetailsProps = {
    vehicule?: Vehicule;
    isLoading: boolean;
    error: Error | null;
};

function Verifications({ vehicule, isLoading, error }: DetailsProps) {
    return (
        <div className="container flex flex-col items-center p-4">
            <h1 className="text-5xl m-10">Verifications</h1>
            {isLoading ? <Loader /> : undefined}
            {!error && !isLoading ? (
                <div className="flex flex-col items-center justify-center w-full p-6">
                    <h2 className="text-xl font-bold">
                        {vehicule?.name.toLocaleUpperCase()}
                    </h2>
                    <div className="divider"></div>
                    <div className="flex flex-col items-start w-full">
                        {vehicule?.elements?.map((element: Element) => {
                            return (
                                <div key={element.id} className="w-full">
                                    <div className="flex justify-between w-full">
                                        <h3 className="text-xl">
                                            {element.name}
                                        </h3>
                                        <RadioInput id={element.id.toString()} />
                                    </div>
                                    <div className="divider"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : undefined}
            {error ? (
                <Alert
                    type="error"
                    display={true}
                    message="Aucun vehicule n'a été trouvé"
                />
            ) : undefined}
        </div>
    );
}

export default Verifications;
