import { QueryTypes } from "sequelize";
import { Elements, Vehicules } from "~~/Models";
import { dbContext } from "~~/Utils/Database";

type SectionRow = {
    id: number;
    name: string;
    vehicule_id: number | null;
    parent_section_id: number | null;
};

type SectionNode = SectionRow & {
    subSections: SectionNode[];
    elements: unknown[];
};

// Charge l'arbre complet des sections d'un véhicule, à profondeur illimitée
// (les sections sont auto-référentielles via parent_section_id, voir Models/Sections.ts).
async function getSectionTreeForVehicule(vehiculeId: number): Promise<SectionNode[]> {
    const sections = await dbContext.query<SectionRow>(
        `WITH RECURSIVE section_tree AS (
            SELECT id, name, vehicule_id, parent_section_id
            FROM sections
            WHERE vehicule_id = :vehiculeId
            UNION ALL
            SELECT s.id, s.name, s.vehicule_id, s.parent_section_id
            FROM sections s
            INNER JOIN section_tree st ON s.parent_section_id = st.id
        )
        SELECT * FROM section_tree`,
        { replacements: { vehiculeId }, type: QueryTypes.SELECT }
    );

    if (sections.length === 0) {
        return [];
    }

    const elements = await Elements.findAll({
        where: { section_id: sections.map((section) => section.id) },
        raw: true
    });

    const nodesById = new Map<number, SectionNode>();
    for (const section of sections) {
        nodesById.set(section.id, { ...section, subSections: [], elements: [] });
    }
    for (const element of elements) {
        nodesById.get(element.section_id as number)?.elements.push(element);
    }

    const roots: SectionNode[] = [];
    for (const section of sections) {
        const node = nodesById.get(section.id)!;
        if (section.parent_section_id === null) {
            roots.push(node);
        } else {
            nodesById.get(section.parent_section_id)?.subSections.push(node);
        }
    }

    return roots;
}

export default class VehiculesRepository {
    public static async getAllVehicules() {
        const vehicules = await Vehicules.findAll();
        return vehicules;
    }

    public static async getOneById(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        return vehicule?.dataValues;
    }

    public static async getOneByIdWithSections(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        if (!vehicule) {
            return undefined;
        }

        const sections = await getSectionTreeForVehicule(id);
        return { ...vehicule.toJSON(), sections };
    }

    public static async createVehicule(data: { name: string }) {
        const vehicule = await Vehicules.create(data);
        return vehicule?.toJSON();
    }

    public static async deleteVehicule(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        if (!vehicule) {
            return null;
        }
        await vehicule.destroy();
        return true;
    }

    // Méthode de compatibilité (à supprimer plus tard)
    public static async getOneByIdWithElements(id: number) {
        return this.getOneByIdWithSections(id);
    }
}
