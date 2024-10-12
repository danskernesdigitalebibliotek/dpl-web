import { cookies } from "next/headers";

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async () => {
    // TODO: clean up this experimental code block.
    const currentCookies = cookies();
    // const sessionCookie = currentCookies.getAll().find((cookie) => {
    //   return cookie.name.match(/^SESS(.+)/);
    // });
    const testCookie =
      "SESSccaeb066c444b6dbb954590b1a54d7c4=t1qglRGooFAR%2Cs6XxGVsvD7tMd7deea4ljknGpN2nvsoKNLP
      ";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS}`,
      // "https://postman-echo.com/post",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options,
          Cookie: `${testCookie}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      }
    );

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || {};
      throw new Error(message || "Error…");
    }

    return json.data;
  };
};
