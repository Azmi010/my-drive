/** Hard cap for single upload (multipart body). Default 3 GB. */
export const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024 * 1024;

/** Cap for reading a file's content into memory for text preview. */
export const TEXT_PREVIEW_MAX_BYTES = 5 * 1024 * 1024;
