type ButtonProps = {
    text: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ text, onClick, id, className, type }: ButtonProps) {
    return <button id={id} onClick={onClick} type={type} className={`btn ${className}`}>{text}</button>;
}

export default Button;
