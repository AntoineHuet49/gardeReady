import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";
import { Sections } from "./Sections";

export function setupAssociations() {
    // Relations Vehicules -> Sections (sections racines)
    Vehicules.hasMany(Sections, {
        foreignKey: "vehicule_id",
        as: "sections",
    });

    Sections.belongsTo(Vehicules, {
        foreignKey: "vehicule_id",
        as: "vehicule",
    });

    // Relations Sections -> Sections (hiérarchie auto-référentielle)
    Sections.hasMany(Sections, {
        foreignKey: "parent_section_id",
        as: "subSections",
    });

    Sections.belongsTo(Sections, {
        foreignKey: "parent_section_id",
        as: "parentSection",
    });

    // Relations Sections -> Elements
    Sections.hasMany(Elements, {
        foreignKey: "section_id",
        as: "elements",
    });

    Elements.belongsTo(Sections, {
        foreignKey: "section_id",
        as: "section",
    });
}
