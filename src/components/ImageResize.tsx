import { useRef, useState } from "react";
import "./imageResize.css";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { useDebounce } from "../hooks/useDebounce";
import "react-image-crop/dist/ReactCrop.css";
import { canvasPreview } from "./canvasPreview";
import { uploadToS3 } from "../utils/uploadToS3";
import { autoCrop } from "../utils/autoCrop";

function ImageResize() {
  const [loadedImage, setLoadedImage] = useState<File>();
  const [imageSource, setImageSource] = useState<string>();
  const [crop, setCrop] = useState<Crop>();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const imageRef = useRef<HTMLImageElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setLoadedImage(e.target.files[0]);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSource(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  useDebounce(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imageRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imageRef.current,
          previewCanvasRef.current,
          completedCrop
        );
      }
    },
    100,
    [completedCrop]
  );

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const currentTarget = e.currentTarget;
    if (aspect) {
      const { width, height } = currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function saveImage() {
    const imageData = new FormData();
    if (previewCanvasRef.current) {
      previewCanvasRef.current.toBlob(
        (blob: any) => {
          const image = new File([blob], "cropedImage", {
            type: blob.type,
            lastModified: new Date().getTime(),
          });
          // upload uncompressed image
          imageData.append("name", "CropedImage");
          imageData.append("file", image);
        },
        "image/jpg",
        1
      );

      await uploadToS3("token", "url", imageData);
    }
  }

  async function autoCropImage() {
    const ratio = 16 / 9;
    if (imageRef.current && previewCanvasRef.current) {
      await autoCrop(ratio, imageRef.current, previewCanvasRef.current);
    }
  }

  return (
    <div>
      <div className="container">
        <div className="header">
          <h1>Image Resize</h1>
        </div>

        <div className="upload-section">
          <div>Upload Image :</div>
          <div className="upload-input">
            <input
              type="file"
              className="upload-input"
              accept="image/*"
              onChange={(e: any) => {
                onSelectFile(e);
              }}
            />
          </div>
        </div>

        <div className="image-section">
          <div className="crop-container">
            <div className="crop-header">Crop Image</div>
            <div className="crop-image">
                {imageSource ? (
                  <ReactCrop
                    style={{maxWidth:'80%', maxHeight:'100%'}}
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    aspect={16 / 9}
                    minHeight={150}
                    minWidth={320}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}}
                      ref={imageRef}
                      className="img-tag"
                      alt="Crop me"
                      src={imageSource}
                      onLoad={(e: any) => {
                        onImageLoad(e);
                      }}
                    />
                  </ReactCrop>
                ) : (
                  <div>Please Upload an Image</div>
                )}
            </div>
          </div>

          <div className="preview-container">
            <div className="preview-header">Crop Preview</div>
            <div className="preview-image">
              <div>
                {!!completedCrop && (
                  <canvas
                    style={{ width: "100%", height: "100%" }}
                    ref={previewCanvasRef}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="button-container">
          <button className="btn crop-btn" onClick={() => autoCropImage()}>
            Auto Crop
          </button>
          <button className="btn save-btn" onClick={() => saveImage()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageResize;
