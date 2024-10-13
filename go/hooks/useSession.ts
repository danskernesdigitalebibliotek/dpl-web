import { TSessionData } from "@/lib/session/session";
import { useEffect, useState } from "react";

const fetchSession = async ({
  setSessionHandler,
  setLoadingHandler
}: {
  setLoadingHandler: (isLoading: boolean) => void;
  setSessionHandler: (session: TSessionData | null) => void;
}) => {
  try {
    const response = await fetch("/auth/session");
    if (response.ok) {
      const session = (await response.json()) as TSessionData;
      setSessionHandler(session);
    }
  } finally {
    setLoadingHandler(false);
  }
};

export default function useSession() {
  const [session, setSession] = useState<TSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession({
      setSessionHandler: setSession,
      setLoadingHandler: setLoading
    });
  }, [session?.isLoggedIn, session?.access_token]);
  return { session, loading };
}
