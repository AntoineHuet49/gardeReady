// Réduit une photo (souvent plusieurs Mo depuis un téléphone) avant envoi pour garder la base légère.
// Si le navigateur ne sait pas décoder l'image, on renvoie le fichier tel quel (le serveur valide).
export async function resizeImage(file: File, maxSize = 1600): Promise<Blob> {
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
        return blob ?? file;
    } catch {
        return file;
    }
}
