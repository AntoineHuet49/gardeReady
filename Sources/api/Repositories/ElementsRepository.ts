import { Elements } from "~~/Models";

export class ElementsRepository {
    public static async getOneById(id: number) {
        return await Elements.findByPk(id);
    }
}