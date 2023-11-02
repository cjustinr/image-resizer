export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    // console.log({image,canvas, ctx})

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight
    /* canvas.width = width
    canvas.height = height */

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')

    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        return null
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = pixelCrop.width
    croppedCanvas.height = pixelCrop.height

    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // As Base64 string
    return croppedCanvas.toDataURL('image/jpeg');

    // As a blob
    /* return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((file) => {
            resolve(URL.createObjectURL(file))
        }, 'image/jpeg')
    }) */
}


export const dataUrlToFile = (url) => {
    const [mediaType, data] = url.split(",");

    let mime = mediaType.match(/:(.*?);/)?.[0];
    mime = mime.replace(':', '').replace(';', '')
    var n = data.length;

    const arr = new Uint8Array(n);

    while (n--) {
        arr[n] = data.charCodeAt(n);
    }

    const randomNumber = Math.floor(Math.random() * 1000000) ?? 0

    return new File([arr], `${randomNumber}.jpg`, { type: mime });
};

export const toFile = (url) => {
    if (url.startsWith('data:')) {
        let arr = url.split(','),
            // mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        const randomNumber = Math.floor(Math.random() * 1000000) ?? 0
        let file = new File([u8arr], `${randomNumber}.jpg`, { type: 'image/jpeg' });
        return Promise.resolve(file);
    }
}



/* const createImage2 = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', error => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    }) */

export const getCroppedImg2 = async (imageSrc, crop, { width = 0, height = 0 }) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    /* setting canvas width & height allows us to 
    resize from the original image resolution */
    canvas.width = width
    canvas.height = height

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
    )

    return canvas.toDataURL('image/jpeg');

    /* return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg')
    }) */
}