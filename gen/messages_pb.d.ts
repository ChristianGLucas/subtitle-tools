// package: christiangeorgelucas.subtitle_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class RawSubtitle extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  getFormat(): string;
  setFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RawSubtitle.AsObject;
  static toObject(includeInstance: boolean, msg: RawSubtitle): RawSubtitle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RawSubtitle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RawSubtitle;
  static deserializeBinaryFromReader(message: RawSubtitle, reader: jspb.BinaryReader): RawSubtitle;
}

export namespace RawSubtitle {
  export type AsObject = {
    content: string,
    format: string,
  }
}

export class Cue extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getStartMs(): number;
  setStartMs(value: number): void;

  getEndMs(): number;
  setEndMs(value: number): void;

  getText(): string;
  setText(value: string): void;

  getContent(): string;
  setContent(value: string): void;

  getSettings(): string;
  setSettings(value: string): void;

  getFieldsMap(): jspb.Map<string, string>;
  clearFieldsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Cue.AsObject;
  static toObject(includeInstance: boolean, msg: Cue): Cue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Cue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Cue;
  static deserializeBinaryFromReader(message: Cue, reader: jspb.BinaryReader): Cue;
}

export namespace Cue {
  export type AsObject = {
    index: number,
    startMs: number,
    endMs: number,
    text: string,
    content: string,
    settings: string,
    fieldsMap: Array<[string, string]>,
  }
}

export class NoteEntry extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getData(): string;
  setData(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NoteEntry.AsObject;
  static toObject(includeInstance: boolean, msg: NoteEntry): NoteEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NoteEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NoteEntry;
  static deserializeBinaryFromReader(message: NoteEntry, reader: jspb.BinaryReader): NoteEntry;
}

export namespace NoteEntry {
  export type AsObject = {
    name: string,
    data: string,
  }
}

export class StyleEntry extends jspb.Message {
  getFieldsMap(): jspb.Map<string, string>;
  clearFieldsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StyleEntry.AsObject;
  static toObject(includeInstance: boolean, msg: StyleEntry): StyleEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StyleEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StyleEntry;
  static deserializeBinaryFromReader(message: StyleEntry, reader: jspb.BinaryReader): StyleEntry;
}

export namespace StyleEntry {
  export type AsObject = {
    fieldsMap: Array<[string, string]>,
  }
}

export class SubtitleDocument extends jspb.Message {
  getFormat(): string;
  setFormat(value: string): void;

  clearCuesList(): void;
  getCuesList(): Array<Cue>;
  setCuesList(value: Array<Cue>): void;
  addCues(value?: Cue, index?: number): Cue;

  getHeader(): string;
  setHeader(value: string): void;

  clearNotesList(): void;
  getNotesList(): Array<NoteEntry>;
  setNotesList(value: Array<NoteEntry>): void;
  addNotes(value?: NoteEntry, index?: number): NoteEntry;

  clearStylesList(): void;
  getStylesList(): Array<StyleEntry>;
  setStylesList(value: Array<StyleEntry>): void;
  addStyles(value?: StyleEntry, index?: number): StyleEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubtitleDocument.AsObject;
  static toObject(includeInstance: boolean, msg: SubtitleDocument): SubtitleDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubtitleDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubtitleDocument;
  static deserializeBinaryFromReader(message: SubtitleDocument, reader: jspb.BinaryReader): SubtitleDocument;
}

export namespace SubtitleDocument {
  export type AsObject = {
    format: string,
    cuesList: Array<Cue.AsObject>,
    header: string,
    notesList: Array<NoteEntry.AsObject>,
    stylesList: Array<StyleEntry.AsObject>,
  }
}

export class SubtitleDocumentResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): SubtitleDocument | undefined;
  setDocument(value?: SubtitleDocument): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubtitleDocumentResult.AsObject;
  static toObject(includeInstance: boolean, msg: SubtitleDocumentResult): SubtitleDocumentResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubtitleDocumentResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubtitleDocumentResult;
  static deserializeBinaryFromReader(message: SubtitleDocumentResult, reader: jspb.BinaryReader): SubtitleDocumentResult;
}

export namespace SubtitleDocumentResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    document?: SubtitleDocument.AsObject,
  }
}

export class RawSubtitleResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  hasSubtitle(): boolean;
  clearSubtitle(): void;
  getSubtitle(): RawSubtitle | undefined;
  setSubtitle(value?: RawSubtitle): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RawSubtitleResult.AsObject;
  static toObject(includeInstance: boolean, msg: RawSubtitleResult): RawSubtitleResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RawSubtitleResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RawSubtitleResult;
  static deserializeBinaryFromReader(message: RawSubtitleResult, reader: jspb.BinaryReader): RawSubtitleResult;
}

export namespace RawSubtitleResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    subtitle?: RawSubtitle.AsObject,
  }
}

export class DetectFormatRequest extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectFormatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DetectFormatRequest): DetectFormatRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectFormatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectFormatRequest;
  static deserializeBinaryFromReader(message: DetectFormatRequest, reader: jspb.BinaryReader): DetectFormatRequest;
}

export namespace DetectFormatRequest {
  export type AsObject = {
    content: string,
  }
}

export class DetectFormatResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getFormat(): string;
  setFormat(value: string): void;

  getDetected(): boolean;
  setDetected(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectFormatResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectFormatResult): DetectFormatResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectFormatResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectFormatResult;
  static deserializeBinaryFromReader(message: DetectFormatResult, reader: jspb.BinaryReader): DetectFormatResult;
}

export namespace DetectFormatResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    format: string,
    detected: boolean,
  }
}

export class ConvertFormatRequest extends jspb.Message {
  hasSource(): boolean;
  clearSource(): void;
  getSource(): RawSubtitle | undefined;
  setSource(value?: RawSubtitle): void;

  getToFormat(): string;
  setToFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConvertFormatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConvertFormatRequest): ConvertFormatRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConvertFormatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConvertFormatRequest;
  static deserializeBinaryFromReader(message: ConvertFormatRequest, reader: jspb.BinaryReader): ConvertFormatRequest;
}

export namespace ConvertFormatRequest {
  export type AsObject = {
    source?: RawSubtitle.AsObject,
    toFormat: string,
  }
}

export class ShiftTimingRequest extends jspb.Message {
  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): SubtitleDocument | undefined;
  setDocument(value?: SubtitleDocument): void;

  getOffsetMs(): number;
  setOffsetMs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShiftTimingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ShiftTimingRequest): ShiftTimingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ShiftTimingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShiftTimingRequest;
  static deserializeBinaryFromReader(message: ShiftTimingRequest, reader: jspb.BinaryReader): ShiftTimingRequest;
}

export namespace ShiftTimingRequest {
  export type AsObject = {
    document?: SubtitleDocument.AsObject,
    offsetMs: number,
  }
}

export class ScaleTimingRequest extends jspb.Message {
  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): SubtitleDocument | undefined;
  setDocument(value?: SubtitleDocument): void;

  getFactor(): number;
  setFactor(value: number): void;

  getFromFps(): number;
  setFromFps(value: number): void;

  getToFps(): number;
  setToFps(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ScaleTimingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ScaleTimingRequest): ScaleTimingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ScaleTimingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ScaleTimingRequest;
  static deserializeBinaryFromReader(message: ScaleTimingRequest, reader: jspb.BinaryReader): ScaleTimingRequest;
}

export namespace ScaleTimingRequest {
  export type AsObject = {
    document?: SubtitleDocument.AsObject,
    factor: number,
    fromFps: number,
    toFps: number,
  }
}

export class PlainTextResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlainTextResult.AsObject;
  static toObject(includeInstance: boolean, msg: PlainTextResult): PlainTextResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlainTextResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlainTextResult;
  static deserializeBinaryFromReader(message: PlainTextResult, reader: jspb.BinaryReader): PlainTextResult;
}

export namespace PlainTextResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    text: string,
  }
}

export class ExtractRangeRequest extends jspb.Message {
  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): SubtitleDocument | undefined;
  setDocument(value?: SubtitleDocument): void;

  getStartMs(): number;
  setStartMs(value: number): void;

  getEndMs(): number;
  setEndMs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractRangeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractRangeRequest): ExtractRangeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractRangeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractRangeRequest;
  static deserializeBinaryFromReader(message: ExtractRangeRequest, reader: jspb.BinaryReader): ExtractRangeRequest;
}

export namespace ExtractRangeRequest {
  export type AsObject = {
    document?: SubtitleDocument.AsObject,
    startMs: number,
    endMs: number,
  }
}

export class CueReadingStat extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getCharCount(): number;
  setCharCount(value: number): void;

  getDurationMs(): number;
  setDurationMs(value: number): void;

  getCharsPerSecond(): number;
  setCharsPerSecond(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CueReadingStat.AsObject;
  static toObject(includeInstance: boolean, msg: CueReadingStat): CueReadingStat.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CueReadingStat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CueReadingStat;
  static deserializeBinaryFromReader(message: CueReadingStat, reader: jspb.BinaryReader): CueReadingStat;
}

export namespace CueReadingStat {
  export type AsObject = {
    index: number,
    charCount: number,
    durationMs: number,
    charsPerSecond: number,
  }
}

export class StatsResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getCueCount(): number;
  setCueCount(value: number): void;

  getTotalDurationMs(): number;
  setTotalDurationMs(value: number): void;

  getFirstStartMs(): number;
  setFirstStartMs(value: number): void;

  getLastEndMs(): number;
  setLastEndMs(value: number): void;

  getAvgCharsPerSecond(): number;
  setAvgCharsPerSecond(value: number): void;

  clearCueStatsList(): void;
  getCueStatsList(): Array<CueReadingStat>;
  setCueStatsList(value: Array<CueReadingStat>): void;
  addCueStats(value?: CueReadingStat, index?: number): CueReadingStat;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatsResult.AsObject;
  static toObject(includeInstance: boolean, msg: StatsResult): StatsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StatsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StatsResult;
  static deserializeBinaryFromReader(message: StatsResult, reader: jspb.BinaryReader): StatsResult;
}

export namespace StatsResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    cueCount: number,
    totalDurationMs: number,
    firstStartMs: number,
    lastEndMs: number,
    avgCharsPerSecond: number,
    cueStatsList: Array<CueReadingStat.AsObject>,
  }
}

export class MergeCuesRequest extends jspb.Message {
  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): SubtitleDocument | undefined;
  setDocument(value?: SubtitleDocument): void;

  getMaxGapMs(): number;
  setMaxGapMs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MergeCuesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MergeCuesRequest): MergeCuesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MergeCuesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MergeCuesRequest;
  static deserializeBinaryFromReader(message: MergeCuesRequest, reader: jspb.BinaryReader): MergeCuesRequest;
}

export namespace MergeCuesRequest {
  export type AsObject = {
    document?: SubtitleDocument.AsObject,
    maxGapMs: number,
  }
}

export class ValidationIssue extends jspb.Message {
  getCueIndex(): number;
  setCueIndex(value: number): void;

  getKind(): string;
  setKind(value: string): void;

  getSeverity(): string;
  setSeverity(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationIssue.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationIssue): ValidationIssue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationIssue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationIssue;
  static deserializeBinaryFromReader(message: ValidationIssue, reader: jspb.BinaryReader): ValidationIssue;
}

export namespace ValidationIssue {
  export type AsObject = {
    cueIndex: number,
    kind: string,
    severity: string,
    message: string,
  }
}

export class ValidationResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getValid(): boolean;
  setValid(value: boolean): void;

  clearIssuesList(): void;
  getIssuesList(): Array<ValidationIssue>;
  setIssuesList(value: Array<ValidationIssue>): void;
  addIssues(value?: ValidationIssue, index?: number): ValidationIssue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationResult): ValidationResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationResult;
  static deserializeBinaryFromReader(message: ValidationResult, reader: jspb.BinaryReader): ValidationResult;
}

export namespace ValidationResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    valid: boolean,
    issuesList: Array<ValidationIssue.AsObject>,
  }
}

