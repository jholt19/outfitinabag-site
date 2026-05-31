"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  buttonText: string;
};

export default function ImageUploadField({
  label,
  name,
  defaultValue,
  buttonText,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/vendor/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      setImageUrl(data.url);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check Cloudinary settings.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </label>

      <input type="hidden" name={name} value={imageUrl} />

      {imageUrl ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-[#f7f5f2]">
          <img
            src={imageUrl}
            alt={label}
            className="h-48 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : buttonText}
        </button>

        {imageUrl ? (
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleUpload(file);
          }
        }}
      />

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}