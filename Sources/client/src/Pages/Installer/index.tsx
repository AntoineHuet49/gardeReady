import { Link } from "react-router";
import { routePath } from "../../App/Routes/routeConstants";

// Guide public (cible du QR code affiché à la caserne) : iOS ne propose pas de bannière d'installation
function Installer() {
    return (
        <div className="container mx-auto max-w-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <img src="/icon-192.png" alt="" className="w-14 h-14 rounded-xl" />
                <h1 className="text-3xl">Installer Véri'Feu</h1>
            </div>
            <p>Ajoutez l'application sur l'écran d'accueil de votre téléphone pour l'ouvrir en plein écran, comme une application classique.</p>

            <div className="card border-2 border-base-300">
                <div className="card-body">
                    <h2 className="card-title">iPhone (Safari)</h2>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Ouvrez ce site dans <strong>Safari</strong>.</li>
                        <li>Touchez le bouton <strong>Partager</strong> (carré avec une flèche vers le haut).</li>
                        <li>Choisissez <strong>Sur l'écran d'accueil</strong>, puis <strong>Ajouter</strong>.</li>
                        <li>Ouvrez Véri'Feu depuis l'écran d'accueil et reconnectez-vous une fois.</li>
                    </ol>
                </div>
            </div>

            <div className="card border-2 border-base-300">
                <div className="card-body">
                    <h2 className="card-title">Android (Chrome)</h2>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Ouvrez ce site dans <strong>Chrome</strong>.</li>
                        <li>Touchez le menu <strong>⋮</strong> en haut à droite.</li>
                        <li>Choisissez <strong>Installer l'application</strong> (ou <strong>Ajouter à l'écran d'accueil</strong>).</li>
                    </ol>
                </div>
            </div>

            <Link to={routePath.home} className="btn btn-primary">Retour à la connexion</Link>
        </div>
    );
}

export { Installer };
