import "./radioInput.scss";

type RadioInputProps = {
    id: string;
};

function RadioInput({ id }: RadioInputProps) {
    return (
        <div className="join">
            <input
                className="join-item btn"
                type="radio"
                name={`option-${id}`}
                aria-label="OK"
            />
            <input
                className="join-item btn"
                type="radio"
                name={`option-${id}`}
                aria-label="KO"
                defaultChecked
            />
        </div>
    );
}

export default RadioInput;
