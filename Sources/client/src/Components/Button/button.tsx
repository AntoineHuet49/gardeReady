type ButtonProps = {
    text: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ text, onClick, id, className }: ButtonProps) {
    return <button id={id} onClick={onClick} className={`btn ${className}`}>{text}</button>;
}

export default Button;
