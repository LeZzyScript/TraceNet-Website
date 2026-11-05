// Free image hosting via Cloudinary, using the same unsigned preset as the
// mobile app. Only the public cloud name + unsigned preset are used here.
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(
  CLOUD_NAME &&
    UPLOAD_PRESET &&
    !String(CLOUD_NAME).startsWith("your-") &&
    !String(UPLOAD_PRESET).startsWith("your-")
);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadPhoto(file) {
  if (!isCloudinaryConfigured) throw new Error("Photo hosting is not configured.");
  if (!file || !String(file.type).startsWith("image/")) {
    throw new Error("Please choose an image file (JPG or PNG).");
  }
  if (file.size > MAX_BYTES) throw new Error("Photo is larger than 8 MB.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!response.ok) throw new Error("Photo upload failed.");
  const data = await response.json();
  return data.secure_url;
}

