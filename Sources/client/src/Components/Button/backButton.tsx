import backButtonIcon from "../../assets/icons/backButton.svg";

function BackButton() {
    return (
        <div className="flex-grow-0">
            <button onClick={() => window.history.back()}>
                <img src={backButtonIcon} />
            </button>
        </div>
    );
}

export default BackButton;
