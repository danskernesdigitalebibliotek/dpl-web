"use client";
import useSession from "@/hooks/useSession";
import { Button } from "../button/Button";

const ExampleUniloginButton = () => {
  const { session, loading } = useSession();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (session?.isLoggedIn) {
    return (
      <Button
        onClick={() => {
          window.location.href = "/auth/logout";
        }}
      >
        Logout
      </Button>
    );
  }
  return (
    <Button
      onClick={() => {
        window.location.href = "/auth/login";
      }}
    >
      Login
    </Button>
  );
};

export default ExampleUniloginButton;
