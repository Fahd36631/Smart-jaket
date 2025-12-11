import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

type OfficerProfile = {
  name: string;
  unit: string;
  rank: string;
  email: string;
};

type Credentials = {
  username: string;
  password: string;
};

type AuthContextValue = {
  officer: OfficerProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (creds: Credentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// معلومات المستخدمين المخزنة في Firestore
const USER_EMAILS: Record<string, string> = {
  fahad: "fahad@smart-jacket.com",
  fahd: "Fahd36631@gmail.com", // المستخدم الجديد
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [officer, setOfficer] = useState<OfficerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // مراقبة حالة المصادقة في Firebase
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          try {
            setFirebaseUser(user);
            if (user) {
              const token = await user.getIdToken();
              setToken(token);
            } else {
              setToken(null);
            }

            if (user) {
              // جلب معلومات المستخدم من Firestore
              try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  setOfficer({
                    name: userData.name || "مستخدم",
                    unit: userData.unit || "",
                    rank: userData.rank || "",
                    email: user.email || "",
                  });
                } else {
                  // إذا لم تكن هناك بيانات في Firestore، نستخدم البيانات الافتراضية
                  const username = user.email?.split("@")[0] || "";
                  if (username.toLowerCase() === "fahad") {
                    setOfficer({
                      name: "المقدم فهد الشمري",
                      unit: "قيادة الرياض",
                      rank: "مقدم",
                      email: user.email || "",
                    });
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
                // في حالة الخطأ، نستخدم البيانات الافتراضية
                if (user.email?.includes("fahad")) {
                  setOfficer({
                    name: "المقدم فهد الشمري",
                    unit: "قيادة الرياض",
                    rank: "مقدم",
                    email: user.email || "",
                  });
                }
              }
            } else {
              setOfficer(null);
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Auth state change error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ username, password }: Credentials) => {
    setLoading(true);

    try {
      if (!username || !password) {
        throw new Error("يرجى إدخال بيانات الدخول");
      }

      const normalizedUsername = username.trim().toLowerCase();
      
      // البحث عن البريد الإلكتروني المرتبط بالاسم
      // أو استخدام الاسم مباشرة إذا كان email
      let email = USER_EMAILS[normalizedUsername];
      
      // إذا لم يكن في القائمة، جرب استخدامه كـ email مباشرة
      if (!email) {
        // إذا كان يحتوي على @، استخدمه كـ email مباشرة
        if (normalizedUsername.includes('@')) {
          email = normalizedUsername;
        } else {
          throw new Error("اسم المستخدم غير صحيح");
        }
      }

      console.log('🔐 محاولة تسجيل الدخول:', { username, email: email.substring(0, 10) + '...' });

      // تسجيل الدخول باستخدام Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // الحصول على Token
      const token = await userCredential.user.getIdToken();
      setToken(token);

      // جلب معلومات المستخدم من Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOfficer({
            name: userData.name || "مستخدم",
            unit: userData.unit || "",
            rank: userData.rank || "",
            email: userCredential.user.email || "",
          });
                } else {
                  // استخدام البيانات الافتراضية
                  const emailLower = userCredential.user.email?.toLowerCase() || "";
                  if (emailLower.includes("fahad") || emailLower.includes("fahd")) {
                    setOfficer({
                      name: "المقدم فهد الشمري",
                      unit: "قيادة الرياض",
                      rank: "مقدم",
                      email: userCredential.user.email || "",
                    });
                  }
                }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // في حالة الخطأ، نستخدم البيانات الافتراضية
        const emailLower = userCredential.user.email?.toLowerCase() || "";
        if (emailLower.includes("fahad") || emailLower.includes("fahd")) {
          setOfficer({
            name: "المقدم فهد الشمري",
            unit: "قيادة الرياض",
            rank: "مقدم",
            email: userCredential.user.email || "",
          });
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // رسائل خطأ واضحة
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.message?.includes("INVALID_LOGIN_CREDENTIALS")) {
        throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("كلمة المرور غير صحيحة");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("البريد الإلكتروني غير صحيح");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة لاحقاً");
      } else {
        throw new Error(error.message || "حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setOfficer(null);
      setToken(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      officer,
      token,
      loading,
      isAuthenticated: Boolean(firebaseUser && officer && token),
      login,
      logout,
    }),
    [firebaseUser, loading, login, logout, officer, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

