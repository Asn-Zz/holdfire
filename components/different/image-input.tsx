import { useRef, useEffect, useState } from "react"
import { ImageIcon } from "lucide-react"
import { Input } from "../ui/input"

interface ImageInputProps {
    imagePreview: string | null
    image: File | null
    handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ImageInput({ imagePreview, image, handleImageInputChange }: ImageInputProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [fileInfo, setFileInfo] = useState('')

    useEffect(() => {
        if (image && imagePreview) {
            const img = new Image();
            img.onload = () => {
                setFileInfo(`${image.name}（${img.naturalWidth}x${img.naturalHeight}）`);
            };
            img.src = imagePreview;
        } else if (image) {
            setFileInfo(`${image.name}（${(image.size / 1024).toFixed(2)} KB）`);
        } else {
            setFileInfo('');
        }
    }, [imagePreview, image])

    return (
        <div className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-muted transition-colors">
                {imagePreview && (
                    <div className="space-y-2">
                        <img
                            src={imagePreview}
                            alt="image preview"
                            className="max-h-48 mx-auto rounded object-contain"
                            onClick={() => fileRef.current?.click()}
                        />
                        <p className="text-sm text-muted-foreground truncate">{fileInfo}</p>
                    </div>
                )}

                <label className="cursor-pointer" style={{ display: imagePreview ? 'none' : 'block' }}>
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageInputChange}
                        ref={fileRef}
                    />
                    <div className="space-y-2">
                        <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="text-sm text-muted-foreground">点击上传图片</p>
                        <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF 等格式</p>
                    </div>
                </label>
            </div>
        </div>
    )
}