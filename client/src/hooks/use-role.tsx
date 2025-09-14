import { useState, useCallback, createContext, useContext } from "react";

export type UserRole = "farmer" | "mill" | "cooperative" | "exporter" | "roaster" | "retailer";

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  roleDisplay: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("cooperative");

  const setRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
  }, []);

  const roleDisplay = {
    farmer: "Farmer",
    mill: "Mill Operator", 
    cooperative: "Co-op Manager",
    exporter: "Exporter",
    roaster: "Roaster",
    retailer: "Retailer"
  }[currentRole];

  return (
    <RoleContext.Provider value={{ currentRole, setRole, roleDisplay }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}
