import { Suspense } from "react";

import loadArticle from "./loadArticle";

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  const data = await loadArticle(id);
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Suspense>
  );
};

export default Page;
