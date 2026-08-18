import { useQuery } from "@tanstack/react-query";
import getBiblioClient from "./biblioClient";

// Ask only about materials the adapter is known to provide. This is not a way
// to find out who provides one - the item already says that.
const useBiblioMaterial = (isbn: string | null) => {
  return useQuery({
    queryKey: ["biblio", "material", isbn],
    // null, not undefined: TanStack Query rejects undefined as query data,
    // which would turn "not found" into a failed query.
    queryFn: async () =>
      (await getBiblioClient().getMetadata(String(isbn))) ?? null,
    enabled: Boolean(isbn)
  });
};

export default useBiblioMaterial;
