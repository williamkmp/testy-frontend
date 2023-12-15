export default async function (originalFile: Blob, targetFileSizeKb: number, maxDeviation = 50): Promise<Blob> {
    if (originalFile.size / 1000 < targetFileSizeKb)
        return originalFile; // File is already smaller

    let low = 0.0;
    let middle = 0.5;
    let high = 1.0;

    let result = originalFile;
    let file = originalFile;
    while (Math.abs(file.size / 1000 - targetFileSizeKb) > maxDeviation) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const img = document.createElement('img');

        const promise = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
        });

        img.src = URL.createObjectURL(originalFile);

        await promise;

        canvas.width = Math.round(img.width * middle);
        canvas.height = Math.round(img.height * middle);
        context.scale(canvas.width / img.width, canvas.height / img.height);
        context.drawImage(img, 0, 0);
        file = await new Promise(resolve => canvas.toBlob(data => resolve(data as Blob)));

        if (file.size / 1000 < (targetFileSizeKb - maxDeviation))
            low = middle;

        else if (file.size / 1000 > targetFileSizeKb)
            high = middle;

        middle = (low + high) / 2;
        result = await new Promise(resolve => canvas.toBlob(data => resolve(data as Blob)));
    }

    return result;
}
