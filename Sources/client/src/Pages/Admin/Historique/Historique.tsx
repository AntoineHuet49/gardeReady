import { useQuery } from "@tanstack/react-query";
import Alert from "../../../Components/Alert/Alert";
import Loader from "../../../Components/Loader/Loader";
import { getVerificationHistory } from "../../../App/utils/Api/Verifications";

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

function Historique() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["verification-history"],
        queryFn: async () => (await getVerificationHistory()).data,
    });

    if (isLoading) return <Loader />;
    if (error) return <Alert display type="error" message="Impossible de charger l'historique" />;
    if (!data?.length) return <p className="text-center py-4">Aucune vérification enregistrée.</p>;

    return (
        <div className="flex flex-col gap-2 py-4">
            {data.map((v) => {
                const ko = v.results.filter((r) => r.status === "KO").length;
                return (
                    <details key={v.id} className="collapse collapse-arrow bg-base-200">
                        <summary className="collapse-title flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{v.vehicule.name}</span>
                            <span>{formatDate(v.created_at)}</span>
                            <span>
                                {v.user.firstname} {v.user.lastname}
                                {v.garde && ` · Garde ${v.garde.numero}`}
                            </span>
                            <span className={`badge ${ko ? "badge-error" : "badge-success"}`}>
                                {ko ? `${ko} KO` : "Tout OK"}
                            </span>
                        </summary>
                        <div className="collapse-content overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr><th>Élément</th><th>Statut</th><th>Commentaire</th></tr>
                                </thead>
                                <tbody>
                                    {v.results.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.element}</td>
                                            <td className={r.status === "KO" ? "text-error font-bold" : ""}>{r.status}</td>
                                            <td>{r.comment}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                );
            })}
        </div>
    );
}

export default Historique;
