import { downloadVerificationPdf, VerificationHistoryItem } from "../../App/utils/Api/Verifications";

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

// Liste repliable de vérifications ; utilisée par « Mes vérifications » et l'onglet admin Historique
function VerificationList({ items }: { items: VerificationHistoryItem[] }) {
    if (!items.length) return <p className="text-center py-4">Aucune vérification enregistrée.</p>;

    return (
        <div className="flex flex-col gap-2 py-4">
            {items.map((v) => {
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
                            {!v.mail_envoye && <span className="badge badge-warning">e-mail non envoyé</span>}
                        </summary>
                        <div className="collapse-content overflow-x-auto">
                            <button className="btn btn-sm btn-outline mb-2" onClick={() => downloadVerificationPdf(v.id)}>
                                Télécharger le PDF
                            </button>
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

export default VerificationList;
