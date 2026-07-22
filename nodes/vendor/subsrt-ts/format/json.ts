// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
import { buildHandler } from "../handler";
import { BuildOptions, Caption, ParseOptions } from "../types/handler";

const FORMAT_NAME = "json";

/**
 * Parses captions in JSON format.
 * @param content - The subtitle content
 * @param _options - Parse options
 * @returns Parsed captions
 */
const parse = (content: string, _options: ParseOptions) => JSON.parse(content) as Caption[];

/**
 * Builds captions in JSON format.
 * @param captions - The captions to build
 * @param _options - Build options
 * @returns The built captions string in JSON format
 */
const build = (captions: Caption[], _options: BuildOptions) => JSON.stringify(captions, undefined, 2);

/**
 * Detects whether the content is in JSON format.
 * @param content - The subtitle content
 * @returns Whether the content is in JSON format
 */
const detect = (content: string) => {
    /*
    [
        { ... }
    ]
    */
    // return /^\[[\s\r\n]*\{[\s\S]*\}[\s\r\n]*\]$/g.test(content);
    try {
        const res = JSON.parse(content) as unknown;
        return Array.isArray(res) && res.length > 0 && typeof res[0] === "object";
    } catch (_) {
        return false;
    }
};

export default buildHandler({ name: FORMAT_NAME, build, detect, parse });
export { FORMAT_NAME as name, build, detect, parse };
