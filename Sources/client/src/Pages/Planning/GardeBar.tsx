import { gardeColor, Shift } from "./shared";

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
            style={{
                borderLeftColor: gardeColor(shift.garde.color),
                backgroundColor: `color-mix(in oklab, ${gardeColor(shift.garde.color)} 25%, transparent)`,
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export default GardeBar;
