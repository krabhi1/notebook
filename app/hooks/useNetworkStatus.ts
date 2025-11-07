import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => {
    // Server-side rendering safe check
    if (typeof window === "undefined") {
      return true; // Assume online during SSR
    }
    return navigator.onLine;
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
      // If we were offline before, mark that we came back online
      if (!isOnline) {
        setWasOffline(true);
        // Reset the wasOffline flag after a short delay
        setTimeout(() => setWasOffline(false), 100);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also listen for network change events if supported
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const handleConnectionChange = () => {
        // Update online status based on connection effective type
        const isConnected =
          connection.effectiveType !== "slow-2g" &&
          connection.effectiveType !== "offline";
        setIsOnline(isConnected && navigator.onLine);
      };

      connection.addEventListener("change", handleConnectionChange);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        connection.removeEventListener("change", handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

// Hook for tracking connection quality
export function useConnectionQuality() {
  const [connectionInfo, setConnectionInfo] = useState(() => {
    if (typeof window === "undefined" || !("connection" in navigator)) {
      return {
        effectiveType: "unknown",
        downlink: 0,
        rtt: 0,
        saveData: false,
      };
    }

    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("connection" in navigator)) {
      return;
    }

    const connection = (navigator as any).connection;

    const updateConnectionInfo = () => {
      setConnectionInfo({
        effectiveType: connection.effectiveType || "unknown",
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      });
    };

    connection.addEventListener("change", updateConnectionInfo);

    return () => {
      connection.removeEventListener("change", updateConnectionInfo);
    };
  }, []);

  return connectionInfo;
}
