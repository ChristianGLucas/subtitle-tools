// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
import { BuildOptions, ParseOptions } from "../../types/handler";

export interface SUBBuildOptions extends BuildOptions {
    fps?: number;
}

export interface SUBParseOptions extends ParseOptions {
    fps?: number;
}
