export async function autoCrop(
  ratio: number,
  imageRef: HTMLImageElement | null,
  canvas: HTMLCanvasElement
) {
  const image = new Image();
  image.crossOrigin = "Anonymous";

  if (imageRef) {
    const { naturalWidth, naturalHeight } = imageRef;
    const imageAspectRatio = naturalWidth / naturalHeight;
    console.log(imageRef, canvas, imageAspectRatio, ratio);

    let cropWidth, cropHeight, offsetX, offsetY;

    if (imageAspectRatio > ratio) {
      cropHeight = naturalHeight;
      cropWidth = cropHeight * ratio;
      offsetX = (naturalWidth - cropWidth) / 2;
      offsetY = 0;
    } else {
      cropWidth = naturalWidth;
      cropHeight = cropWidth / ratio;
      offsetX = 0;
      offsetY = (naturalHeight - cropHeight) / 2;
    }

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.drawImage(
        imageRef,
        offsetX,
        offsetY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      canvas.toBlob(
        (blob) => {
          const croppedImageUrl = URL.createObjectURL(blob);
          return croppedImageUrl;
        },
        "image/jpeg",
        1
      );
    }
  }
}
