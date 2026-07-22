// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
import { Handler } from "../handler";

import { BaseHandler, Caption, ConvertOptions, ResyncOptions } from "./handler";

export type ResyncFunction = (a: number[]) => number[];

export type SubsrtFormats = Record<string, Handler>;

export interface SubsrtInterface extends Omit<BaseHandler, "name" | "helper"> {
    format: SubsrtFormats;
    list: () => string[];
    convert: (content: string, options?: ConvertOptions | string) => string;
    resync: (captions: Caption[], options?: ResyncFunction | number | ResyncOptions) => Caption[];
}
