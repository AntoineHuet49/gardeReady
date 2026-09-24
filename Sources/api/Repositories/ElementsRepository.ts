import { Elements } from "~~/Models";
import { CreateElementDto, UpdateElementDto } from "~~/Types/DTO/ElementDto";

export class ElementsRepository {
    public static async getOneById(id: number) {
        return await Elements.findByPk(id);
    }

    public static async createElement(elementData: CreateElementDto) {
        const element = await Elements.create(elementData);
        return element.toJSON();
    }

    public static async updateElement(id: number, elementData: UpdateElementDto) {
        const [affectedRows] = await Elements.update(elementData, {
            where: { id }
        });
        
        if (affectedRows === 0) {
            return null;
        }
        
        const updatedElement = await Elements.findByPk(id);
        return updatedElement?.toJSON();
    }

    public static async deleteElement(id: number) {
        const affectedRows = await Elements.destroy({
            where: { id }
        });
        
        return affectedRows > 0;
    }
}