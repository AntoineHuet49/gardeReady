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
            className={`collapse collapse-arrow ${getBackgroundClass(level)} ${getBorderClass(level)} mb-2`}
        >
            <input type="checkbox" defaultChecked={defaultOpen} aria-label={title} />
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
