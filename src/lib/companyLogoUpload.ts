export const COMPANY_LOGO_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/svg+xml",
  "image/png",
  "image/webp",
  "image/jpeg",
  "image/jpg",
]);

const ALLOWED_LOGO_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];

export function validateCompanyLogoFile(file: File) {
  if (file.size > COMPANY_LOGO_MAX_SIZE_BYTES) {
    return "Logo files must be 5 MB or smaller.";
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_LOGO_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension)
  );
  const hasAllowedMimeType =
    !file.type || ALLOWED_LOGO_MIME_TYPES.has(file.type.toLowerCase());

  if (!hasAllowedExtension || !hasAllowedMimeType) {
    return "Upload an SVG, PNG, WEBP, or JPG logo file.";
  }

  return null;
}

export async function uploadFileToConvexStorage(
  file: File,
  generateUploadUrl: () => Promise<string>
) {
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Logo upload failed.");
  }

  const { storageId } = (await response.json()) as { storageId?: string };

  if (!storageId) {
    throw new Error("Logo upload did not return a storage id.");
  }

  return storageId;
}

