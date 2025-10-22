type HierarchyIndicatorProps = {
    level: number;
    isLast?: boolean;
};

/**
 * Composant pour afficher un indicateur visuel de la hiérarchie
 * Utilise des symboles pour montrer la structure arborescente
 */
const HierarchyIndicator = ({ level, isLast = false }: HierarchyIndicatorProps) => {
    if (level === 0) return null;

    const generateLines = () => {
        const lines = [];
        
        // Pour chaque niveau, ajouter une ligne de connexion
        for (let i = 1; i < level; i++) {
            lines.push(
                <span key={i} className="text-gray-300 mr-1">
                    │
                </span>
            );
        }
        
        // Dernière ligne avec symbole de branche
        lines.push(
            <span key="branch" className="text-gray-300 mr-1">
                {isLast ? "└─" : "├─"}
            </span>
        );
        
        return lines;
    };

    return (
        <span className="font-mono text-xs">
            {generateLines()}
        </span>
    );
};

export default HierarchyIndicator;