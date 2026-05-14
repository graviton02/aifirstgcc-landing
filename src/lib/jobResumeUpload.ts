import {
  RESUME_MAX_SIZE_BYTES,
  isPdfResumeFile,
} from "@/jobs/config";

export function validateResumeFile(file: File) {
  if (file.size > RESUME_MAX_SIZE_BYTES) {
    return "Resume files must be 5 MB or smaller.";
  }

  if (!isPdfResumeFile({ fileName: file.name, contentType: file.type })) {
    return "Upload a PDF resume.";
  }

  return null;
}
