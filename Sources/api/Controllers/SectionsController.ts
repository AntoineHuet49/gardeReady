import { Request, Response } from "express";
import { SectionsRepository } from "~~/Repositories/SectionsRepository";
import { BaseController } from "./BaseController";
import { createLogger } from "~~/Utils/Logger";

export default class SectionsController extends BaseController {
    private static logger = createLogger('SectionsController');

    public static async createSection(req: Request, res: Response): Promise<void> {
        const logger = SectionsController.logger;
        
        try {
            logger.debug("Début création de section");
            logger.httpRequest({
                method: req.method,
                url: req.url,
                body: req.body,
                headers: req.headers as Record<string, unknown>
            });

            const { name, vehicule_id, parent_section_id } = req.body;
            
            logger.debug("Données extraites", {
                name,
                vehicule_id,
                parent_section_id,
                types: {
                    name: typeof name,
                    vehicule_id: typeof vehicule_id,
                    parent_section_id: typeof parent_section_id
                }
            });
            
            if (!name) {
                logger.warn("Validation échouée: nom manquant");
                res.status(400).json({ error: "Le nom de la section est requis" });
                return;
            }

            // Vérifier qu'on a soit un vehicule_id soit un parent_section_id
            if (!vehicule_id && !parent_section_id) {
                logger.warn("Validation échouée: ni vehicule_id ni parent_section_id");
                res.status(400).json({ error: "Une section doit être liée à un véhicule ou à une section parent" });
                return;
            }

            logger.info("Validation passée, création en cours...");
            
            const sectionData = { 
                name, 
                vehicule_id: vehicule_id || null, 
                parent_section_id: parent_section_id || null 
            };
            
            logger.sent("Données envoyées au repository", sectionData);
            
            const section = await SectionsRepository.createSection(sectionData);
            
            logger.success("Section créée avec succès", {
                id: section.id,
                name: section.name,
                vehicule_id: section.vehicule_id,
                parent_section_id: section.parent_section_id
            });
            
            res.status(201).json(section);
        } catch (error) {
            logger.sequelizeError("Erreur lors de la création de la section", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async updateSection(req: Request, res: Response): Promise<void> {
        const logger = SectionsController.logger;
        
        try {
            const id = parseInt(req.params.id);
            const { name } = req.body;
            
            logger.debug("Début mise à jour de section", { id, name });
            
            if (!name) {
                logger.warn("Validation échouée: nom manquant");
                res.status(400).json({ error: "Le nom est requis" });
                return;
            }

            const section = await SectionsRepository.updateSection(id, { name });
            if (!section) {
                logger.warn("Section non trouvée", { id });
                res.status(404).json({ error: "Section non trouvée" });
                return;
            }

            logger.success("Section mise à jour", { id, name });
            res.json(section);
        } catch (error) {
            logger.error("Erreur lors de la mise à jour de la section", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async deleteSection(req: Request, res: Response): Promise<void> {
        const logger = SectionsController.logger;
        
        try {
            const id = parseInt(req.params.id);
            
            logger.debug("Début suppression de section", { id });
            
            const deleted = await SectionsRepository.deleteSection(id);
            if (!deleted) {
                logger.warn("Section non trouvée", { id });
                res.status(404).json({ error: "Section non trouvée" });
                return;
            }

            logger.success("Section supprimée", { id });
            res.status(204).send();
        } catch (error) {
            logger.error("Erreur lors de la suppression de la section", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }
}