import { gardeTint, Shift } from "./shared";

type GardeBarProps = {
    shift: Shift;
    isMine: boolean;
    onSelect: (shift: Shift) => void;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
};

// Bloc cliquable teinté de la couleur de la garde (lisible en thème clair comme sombre)
function GardeBar({ shift, isMine, onSelect, className = "", style, children }: GardeBarProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(shift)}
            className={`text-left rounded-md border-l-4 cursor-pointer hover:brightness-95 ${isMine ? "ring-2 ring-primary" : ""} ${className}`}
            style={{ ...gardeTint(shift.garde.color), ...style }}
        >
            {children}
        </button>
    );
}

export default GardeBar;
