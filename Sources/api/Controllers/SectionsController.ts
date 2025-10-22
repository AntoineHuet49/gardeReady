import { Request, Response } from "express";
import { SectionsRepository } from "~~/Repositories/SectionsRepository";
import { BaseController } from "./BaseController";

export default class SectionsController extends BaseController {
    public static async createSection(req: Request, res: Response): Promise<void> {
        try {
            const { name, vehicule_id, parent_section_id } = req.body;
            
            if (!name) {
                res.status(400).json({ error: "Le nom de la section est requis" });
                return;
            }

            // Vérifier qu'on a soit un vehicule_id soit un parent_section_id
            if (!vehicule_id && !parent_section_id) {
                res.status(400).json({ error: "Une section doit être liée à un véhicule ou à une section parent" });
                return;
            }

            const section = await SectionsRepository.createSection({ 
                name, 
                vehicule_id: vehicule_id || null, 
                parent_section_id: parent_section_id || null 
            });
            res.status(201).json(section);
        } catch (error) {
            console.error("Erreur lors de la création de la section:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async updateSection(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name } = req.body;
            
            if (!name) {
                res.status(400).json({ error: "Le nom est requis" });
                return;
            }

            const section = await SectionsRepository.updateSection(id, { name });
            if (!section) {
                res.status(404).json({ error: "Section non trouvée" });
                return;
            }

            res.json(section);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la section:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async deleteSection(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            const deleted = await SectionsRepository.deleteSection(id);
            if (!deleted) {
                res.status(404).json({ error: "Section non trouvée" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error("Erreur lors de la suppression de la section:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }
}