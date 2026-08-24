import * as os from "node:os";
import * as path from "node:path";

/** Temp dir for multer disk storage before streaming to MinIO. */
export const UPLOAD_TMP_DIR =
  process.env.UPLOAD_TMP_DIR ?? path.join(os.tmpdir(), "mydrive-uploads");
