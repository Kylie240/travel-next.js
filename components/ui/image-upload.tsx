"use client"

import { X, Upload } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import Image from "next/image"
import createClient from "@/utils/supabase/client"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  bucket: string
  folder: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  bucket,
  folder
}: ImageUploadProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
      const file = event.target.files?.[0];
      const fileExt = file?.name.split('.').pop()?.toLowerCase()
      
      if (!file) return;

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(fileExt || '')) {
        toast.error("File type not accepted. Please use JPG, JPEG, PNG or WEBP.");
        setUploadingImage(false);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be under 10MB");
        setUploadingImage(false);
        return;
      }

      let filePath = '';
      if(bucket === "itinerary-images") { 
        filePath = `${folder}/${uuidv4()}.${fileExt}`;
      } else {
        filePath = `${folder}/${Date.now()}/${uuidv4()}.${fileExt}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload image")
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(data.publicUrl);
      toast.success("Image uploaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div>
      <div className="w-full">
        {value && value !== "" ? (
          <div className="relative">
            <div className={`${folder.includes("main") ? "h-[150px]" : "h-[100px]"} w-[300px] relative`}>
              <Image 
                src={value} 
                alt="Preview" 
                fill
                className="w-full h-full object-cover rounded-lg" 
              />
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = Array.from(e.dataTransfer.files);
              if (files[0]) {
                handleImageUpload({ target: { files: [files[0]] } } as any);
              }
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer shadow-md flex items-center gap-2 border border-gray-200 rounded-lg px-6 py-2 hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={disabled || uploadingImage}
                />
                <span className="bg-white text-sm md:text:md rounded-full font-medium">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
              </label>
              <div className="flex flex-col">
                <span className="text-gray-600 text-[14px] font-medium">Choose images or drag & drop it here.</span>
                <span className="text-gray-500 text-sm">JPG, JPEG, PNG and WEBP. Max 10 MB.</span>
              </div>
            </div>
          </div>
          )}
      </div>
    </div>
  )
}
