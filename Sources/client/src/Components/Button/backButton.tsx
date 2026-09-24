import backButtonIcon from "../../assets/icons/backButton.svg";

function BackButton() {
    return (
        <div className="flex-grow-0">
            <button className="p-2.5" aria-label="Retour" onClick={() => window.history.back()}>
                <img src={backButtonIcon} alt="" />
            </button>
        </div>
    );
}

export default BackButton;
