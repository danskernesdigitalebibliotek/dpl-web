import { createBiblioClient } from "@danskernesdigitalebibliotek/dpl-service-layer";
import getBiblioConfig from "./biblioConfig";

// The config is resolved on each call, not once: the base url and tokens do
// not exist until the app has mounted and dispatched its data attributes.
const getBiblioClient = () => createBiblioClient(getBiblioConfig());

export default getBiblioClient;
