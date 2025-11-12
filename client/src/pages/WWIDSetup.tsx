
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function WWIDSetup() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to PIN setup since WWID is no longer needed
    setLocation("/pin-setup");
  }, [setLocation]);

  return null;
}
