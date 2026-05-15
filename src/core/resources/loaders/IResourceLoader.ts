import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";

export interface IResourceLoader {
  load(item: ResourceItem, resources: ResourceC): Promise<void>;
}
