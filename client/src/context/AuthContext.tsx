// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Extend Firebase User type with role property
export interface User extends FirebaseUser {
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(firestore, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          const userWithRole = firebaseUser as User;

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userWithRole.role = userData.role || "user"; // fallback to 'user' if role not set
          } else {
            // If user doc not found, default role or handle error
            userWithRole.role = "user";
          }

          setUser(userWithRole);
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          setUser(firebaseUser); // fallback if there's an error
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      // Demo logic for admin role
      const email = userCredential.user.email?.toLowerCase();
      if (email === 'admin@example.com') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const updateProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    await firebaseUpdateProfile(auth.currentUser, profile);
    setUser({ ...auth.currentUser }); // update context with new info
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
