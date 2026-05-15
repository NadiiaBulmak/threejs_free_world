export type LoaderKind = "texture" | "image" | "audio" | "mesh" | "vfx";

export interface ResourceItem {
  id: string;
  url: string;
  meta?: Record<string, unknown>;
}

export interface ResourceGroup {
  items: ResourceItem[];
  loader: LoaderKind;
}
