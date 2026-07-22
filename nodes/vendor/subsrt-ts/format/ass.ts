// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
import { buildHandler } from "../handler";

const FORMAT_NAME = "ass";

// Compatible format
import { build, detect, helper, parse } from "./ssa";

export default buildHandler({ name: FORMAT_NAME, build, detect, helper, parse });
export { FORMAT_NAME as name, build, detect, helper, parse };
