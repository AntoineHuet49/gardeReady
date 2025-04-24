import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";

export function setupAssociations() {
    Vehicules.belongsToMany(Elements, {
        through: "vehicules_elements",
        foreignKey: "vehicule_id",
        otherKey: "element_id",
        as: "elements",
        timestamps: false,
    });

    Elements.belongsToMany(Vehicules, {
        through: "vehicules_elements",
        foreignKey: "element_id",
        otherKey: "vehicule_id",
        as: "vehicules",
        timestamps: false,
    });
}
