import { useQuery } from "@tanstack/react-query";
import getBiblioClient from "./biblioClient";
import { biblioQueryOptions } from "./biblioQueryOptions";

export const biblioLoansQueryKey = ["biblio", "loans"];

// The endpoint returns active loans only.
const useBiblioLoans = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    ...biblioQueryOptions,
    queryKey: biblioLoansQueryKey,
    queryFn: () => getBiblioClient().getLoans(),
    enabled
  });
};

export default useBiblioLoans;
