type ButtonProps = {
    text: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ text, onClick, id }: ButtonProps) {
    return <button id={id} onClick={onClick} className="btn">{text}</button>;
}

export default Button;
