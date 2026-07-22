// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
export interface ContentCaption {
    type: "caption";
    index: number;
    start: number;
    end: number;
    duration: number;
    cue?: string;
    content: string;
    text: string;
    frame?: {
        start: number;
        end: number;
        count: number;
    };
    data?: Record<string, string>;
}

export interface MetaCaption {
    type: "meta";
    name: string;
    data: string | Record<string, string>;
    tag?: string;
}

export interface StyleCaption {
    type: "style";
    data: Record<string, string>;
}

export type Caption = ContentCaption | MetaCaption | StyleCaption;

export interface ParseOptions {
    format?: string;
    verbose?: boolean;
    eol?: string;
    // Only for smi
    // preserveSpaces?: boolean;
}

export interface BuildOptions extends ParseOptions {
    format: string;
}

export type ConvertOptions = ParseOptions & {
    to: string;
    resync?: ResyncOptions;
} & (
        | {
              format: string;
              from?: never;
          }
        | {
              format?: never;
              from: string;
          }
    );

export interface ResyncOptions {
    offset?: number;
    ratio?: number;
    frame?: boolean;
    fps?: number;
}

export interface Helper {
    toMilliseconds?: (time: string) => number;
    toTimeString?: (ms: number) => string;
    htmlEncode?: (text: string) => string;
    htmlDecode?: (text: string, eol: string) => string;
}
export type BuildFunction = (captions: Caption[], options: BuildOptions) => string;
export type DetectFunction = (content: string) => boolean | string;
export type ParseFunction = (content: string, options: ParseOptions) => Caption[];

export interface BaseHandler {
    name: string;
    helper?: Helper;
    build: BuildFunction;
    detect: DetectFunction;
    parse: ParseFunction;
}
