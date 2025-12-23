import Loader from "../../../Components/Loader/Loader";
import { Garde } from "../../../Types/Garde";

type GardesProps = {
    gardes?: Garde[];
    isLoading: boolean;
    error: Error | null;
};

function Gardes({ gardes, isLoading }: GardesProps) {
    return (
        <>
            {isLoading && <Loader />}
            {gardes && gardes.length > 0 && (
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-3.5">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th></th>
                                <th>Nom</th>
                                <th>Responsable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gardes.map((garde) => (
                                <tr className="hover:bg-base-300" key={garde.id}>
                                    <th>{garde.id}</th>
                                    <td>{garde.numero}</td>
                                    <td>
                                        {garde.responsableUser 
                                            ? `${garde.responsableUser.firstname} ${garde.responsableUser.lastname}`
                                            : `ID: ${garde.responsable}`
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

export default Gardes;
