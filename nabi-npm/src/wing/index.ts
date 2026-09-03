// wing 층의 문 — 계약·registry·팩토리·키 소유 판정·공용 부품이 여기서 나간다.
// The wing layer's door — contract, registry, factories, key-ownership resolution, and shared ops all export from here.
export { erectsNode } from './contract.js';
export type { Attach, AttachHost } from './contract.js';
export type {
  ArrowDir,
  ContextControl,
  InputRule,
  KeyIntent,
  KeyName,
  OnKey,
  OwnerAt,
  StructureDecl,
  Wing,
  WingAction,
  WingButton,
  WingChoice,
  WingContext,
  WingField,
  WingPlace,
} from './contract.js';
export {
  $createNabiWith,
  createNabiWith,
  makeRegistry,
  nabiOptionsOf,
  renderStoredEditorHtml,
  renderStoredHtml,
} from './registry.js';
export type { RegisteredRule, Registry, RegistryExtra, StoredHtmlOptions } from './registry.js';
export { keyOwnerAt, routeKey } from './owner.js';
export type { KeyOwner } from './owner.js';
export { boxObject, listFamily, simpleMark, valueMark } from './factories.js';
export type { BoxObjectSpec, ListFamilySpec, SimpleMarkSpec, ValueMarkSpec } from './factories.js';
export {
  LUMP_DEFAULT_ALIGN,
  LUMP_DEFAULT_WIDTH,
  insertLump,
  markSpanAt,
  removeLump,
  toggleWrap,
  topNodeAt,
  unwrapItem,
} from './ops.js';
