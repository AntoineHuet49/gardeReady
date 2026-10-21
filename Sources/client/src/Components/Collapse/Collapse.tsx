import { useRef } from "react";

// Durée de l'animation d'ouverture DaisyUI : on attend que le contenu ait sa hauteur finale
const OPEN_ANIMATION_MS = 300;

type CollapseProps = {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    level?: number; // Pour adapter le style selon le niveau de profondeur
};

const Collapse = ({
    title,
    children,
    defaultOpen = false,
    level = 0,
}: CollapseProps) => {
    const rootRef = useRef<HTMLDivElement>(null);

    // À l'ouverture : section centrée à l'écran, ou calée en haut si elle est plus haute que la fenêtre
    const scrollOnOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.checked) return;
        setTimeout(() => {
            const el = rootRef.current;
            if (!el) return;
            el.scrollIntoView({
                block: el.offsetHeight > window.innerHeight ? "start" : "center",
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
        }, OPEN_ANIMATION_MS);
    };

    // Styles dynamiques basés sur le niveau
    const getBorderClass = (level: number) => {
        if (level === 0) return "border-2 border-base";
        return "border-1 border-base";
    };

    const getTitleClass = (level: number) => {
        const fontWeight =
            level === 0
                ? "font-bold"
                : level === 1
                  ? "font-semibold"
                  : "font-medium";

        return `${fontWeight} text-base`;
    };

    // Style d'arrière-plan alternant pour une meilleure lisibilité
    const getBackgroundClass = (level: number) => {
        if (level % 2 === 0) return "bg-base-100";
        return "bg-base-50";
    };

    return (
        <div
            ref={rootRef}
            className={`collapse collapse-arrow ${getBackgroundClass(level)} ${getBorderClass(level)} mb-2`}
        >
            <input type="checkbox" defaultChecked={defaultOpen} onChange={scrollOnOpen} aria-label={title} />
            <div className={`collapse-title ${getTitleClass(level)}`}>
                {title}
                {level > 5 && (
                    <span className="text-xs text-gray-400 ml-2">
                        (niveau {level})
                    </span>
                )}
            </div>
            <div className="collapse-content">
                <div className="pt-2">{children}</div>
            </div>
        </div>
    );
};

export default Collapse;
