// moduleResolution "node" ignores package exports, so point the subpath at
// the types swiper declares for it.
declare module "swiper/bundle" {
  export { default } from "swiper";
}
