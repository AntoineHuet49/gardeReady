import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";
import { Sections } from "./Sections";
import { Gardes } from "./Garde";
import { Users } from "./Users";

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

    // Relations Gardes -> Users (responsable)
    // Un responsable ne peut être responsable que d'une seule garde
    Gardes.belongsTo(Users, {
        foreignKey: "responsable",
        as: "responsableUser",
    });

    Users.hasOne(Gardes, {
        foreignKey: "responsable",
        as: "gardeResponsable",
    });

    // Relations Users -> Gardes (garde_id)
    // Un utilisateur appartient à une garde
    Users.belongsTo(Gardes, {
        foreignKey: "garde_id",
        as: "garde",
    });

    Gardes.hasMany(Users, {
        foreignKey: "garde_id",
        as: "users",
    });
}

