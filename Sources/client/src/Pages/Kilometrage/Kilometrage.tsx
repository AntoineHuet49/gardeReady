import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../App/Provider/UserProvider";
import { getAllVehicules } from "../../App/utils/Api/Vehicules";
import { useAddKilometrage, useKilometrages } from "../../hooks/useKilometrages";
import Button from "../../Components/Button/button";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

function Kilometrage() {
    const { isAdmin } = useUser();
    const { data: vehicules = [] } = useQuery({
        queryKey: ["vehicules-list"],
        queryFn: () => getAllVehicules().then((response) => response.data),
    });
    const [vehiculeId, setVehiculeId] = useState<number | null>(null);
    const [kilometrage, setKilometrage] = useState("");
    const [motif, setMotif] = useState("");
    const add = useAddKilometrage();
    const { data: history = [] } = useKilometrages(vehiculeId, isAdmin);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (vehiculeId === null) return;
        add.mutate(
            { vehiculeId, kilometrage: Number(kilometrage), motif: motif.trim() || undefined },
            { onSuccess: () => { setKilometrage(""); setMotif(""); } },
        );
    };

    return (
        <div className="w-full max-w-3xl px-4 pb-10 flex flex-col gap-8">
            <form onSubmit={submit} className="card bg-base-200 p-4 flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                    Véhicule
                    <select className="select w-full" required value={vehiculeId ?? ""}
                        onChange={(e) => setVehiculeId(e.target.value ? Number(e.target.value) : null)}>
                        <option value="">Choisir un véhicule</option>
                        {vehicules.map((v) => <option key={v.id} value={v.id}>{v.name.toUpperCase()}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-1">
                    Kilométrage (km)
                    <input className="input w-full" type="number" inputMode="numeric" min={0} step={1} required
                        value={kilometrage} onChange={(e) => setKilometrage(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1">
                    Motif (optionnel)
                    <input className="input w-full" type="text" maxLength={200} placeholder="Intervention, manœuvre…"
                        value={motif} onChange={(e) => setMotif(e.target.value)} />
                </label>
                <Button type="submit" text="Enregistrer" className="btn-primary" disabled={add.isPending || vehiculeId === null} />
            </form>

            {isAdmin && vehiculeId !== null && (
                <section aria-label="Historique">
                    <h2 className="text-2xl mb-2">Historique</h2>
                    {history.length === 0 ? (
                        <p className="opacity-70">Aucun relevé pour ce véhicule.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead><tr><th>Date</th><th>Km</th><th>Agent</th><th>Motif</th></tr></thead>
                                <tbody>
                                    {history.map((h) => (
                                        <tr key={h.id}>
                                            <td>{dateFormat.format(new Date(h.created_at))}</td>
                                            <td>{h.kilometrage.toLocaleString("fr-FR")}</td>
                                            <td>{h.user ? `${h.user.firstname} ${h.user.lastname}` : ""}</td>
                                            <td>{h.motif}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default Kilometrage;
