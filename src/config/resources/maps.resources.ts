import type { ResourceGroup } from "@engine-types/resources";

const freeExr = new URL("../../resources/maps/144_hdrmaps_com_free_2K.exr", import.meta.url).href;

export const mapResources: ResourceGroup = {
  items: [
    // Primary environment (EXR) to be loaded via the 'env' loader
    { id: "env_free_exr", url: freeExr },
    // Fallback JPG/others may be added as additional items
  ],
  loader: "env",
};

export default mapResources;
