// @ts-nocheck -- vendored subsrt-ts source; see NOTICE.md (upstream compiles clean under its own strict:true tsconfig; this project sets strict:false, under which a handful of discriminated-union narrowing sites in the ORIGINAL upstream code do not typecheck — this is a typecheck-only skip, zero behavior change, nothing here was rewritten)
import { SubsrtFormats } from "../types/subsrt";

import ass from "./ass";
import json from "./json";
import lrc from "./lrc";
import sbv from "./sbv";
import smi from "./smi";
import srt from "./srt";
import ssa from "./ssa";
import sub from "./sub";
import vtt from "./vtt";

const formats = {
    vtt,
    lrc,
    smi,
    ssa,
    ass,
    sub,
    srt,
    sbv,
    json,
} as SubsrtFormats;

export default formats;
