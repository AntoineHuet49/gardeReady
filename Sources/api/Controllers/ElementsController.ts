import { Request, Response } from "express";
import { ElementsRepository } from "~~/Repositories/ElementsRepository";
import { BaseController } from "./BaseController";

export default class ElementsController extends BaseController {
    public static async createElement(req: Request, res: Response): Promise<void> {
        try {
            const { name, section_id } = req.body;
            
            if (!name || !section_id) {
                res.status(400).json({ error: "Le nom et l'ID de section sont requis" });
                return;
            }

            const element = await ElementsRepository.createElement({ name, section_id });
            res.status(201).json(element);
        } catch (error) {
            console.error("Erreur lors de la création de l'élément:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async updateElement(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name } = req.body;
            
            if (!name) {
                res.status(400).json({ error: "Le nom est requis" });
                return;
            }

            const element = await ElementsRepository.updateElement(id, { name });
            if (!element) {
                res.status(404).json({ error: "Élément non trouvé" });
                return;
            }

            res.json(element);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'élément:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    public static async deleteElement(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            const deleted = await ElementsRepository.deleteElement(id);
            if (!deleted) {
                res.status(404).json({ error: "Élément non trouvé" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'élément:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }
}