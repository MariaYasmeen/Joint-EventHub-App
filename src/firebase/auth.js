// src/firebase/auth.js
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* -------------------------------------------------------
   REGISTER USER (Auth + Firestore Profile)
   Student domain = @fjwu.edu.pk
   Manager account = manager@fjwu.edu.pk (cannot register)
------------------------------------------------------- */
export const registerUser = async (name, email, password) => {
  try {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required." };
    }

    let role = "student"; // default role

    // ❌ Manager cannot register
    if (email === "manager@fjwu.edu.pk") {
      return {
        success: false,
        error: "Manager account cannot be created here.",
      };
    }

    // ✅ Student email validation
    const allowedDomain = "@fjwu.edu.pk";
    if (!email.endsWith(allowedDomain)) {
      return {
        success: false,
        error: `Only FJWU students can register. Use your ${allowedDomain} email.`,
      };
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save profile in Firestore
    const profile = {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), profile);

    // Save role locally
    localStorage.setItem("userRole", role);

    return { success: true, user, data: profile };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   LOGIN USER
   Auto-assign role:
   manager@fjwu.edu.pk → manager
   students → student
------------------------------------------------------- */
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    // Firebase Login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Read Firestore profile
    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return { success: false, error: "User profile not found." };
    }

    let profileData = profileSnapshot.data();

    // ✅ FORCE MANAGER ROLE
    if (user.email === "manager@fjwu.edu.pk") {
      profileData.role = "manager";
    }

    // Save role locally
    localStorage.setItem("userRole", profileData.role);

    return { success: true, user, data: profileData };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   LOGOUT USER
------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userRole");
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   FRIENDLY FIREBASE ERROR MESSAGES
------------------------------------------------------- */
const mapAuthError = (error) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return error.message?.replace("Firebase:", "").trim() || "Unknown error.";
  }
};
