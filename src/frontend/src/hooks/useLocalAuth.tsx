import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface LocalAuthContextType {
  identity: Ed25519KeyIdentity | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (name: string) => Promise<void>;
  logout: () => void;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(
  undefined,
);

const LOCAL_IDENTITY_KEY = "local_identity";
const LOCAL_NAME_KEY = "local_display_name";

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Ed25519KeyIdentity | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Load persisted identity and name on mount
    const loadPersistedAuth = async () => {
      try {
        const storedIdentity = localStorage.getItem(LOCAL_IDENTITY_KEY);
        const storedName = localStorage.getItem(LOCAL_NAME_KEY);

        if (storedIdentity && storedName) {
          const identityData = JSON.parse(storedIdentity);
          const restoredIdentity = Ed25519KeyIdentity.fromJSON(identityData);
          setIdentity(restoredIdentity);
          setDisplayName(storedName);
        }
      } catch (error) {
        console.error("Failed to restore identity:", error);
        localStorage.removeItem(LOCAL_IDENTITY_KEY);
        localStorage.removeItem(LOCAL_NAME_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    loadPersistedAuth();
  }, []);

  const login = async (name: string) => {
    if (!name.trim()) {
      throw new Error("Display name is required");
    }

    // Generate a new identity
    const newIdentity = Ed25519KeyIdentity.generate();

    // Persist to localStorage
    const identityJSON = newIdentity.toJSON();
    localStorage.setItem(LOCAL_IDENTITY_KEY, JSON.stringify(identityJSON));
    localStorage.setItem(LOCAL_NAME_KEY, name);

    setIdentity(newIdentity);
    setDisplayName(name);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_IDENTITY_KEY);
    localStorage.removeItem(LOCAL_NAME_KEY);
    setIdentity(null);
    setDisplayName(null);
  };

  return (
    <LocalAuthContext.Provider
      value={{
        identity,
        displayName,
        isAuthenticated: !!identity,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error("useLocalAuth must be used within LocalAuthProvider");
  }
  return context;
}
