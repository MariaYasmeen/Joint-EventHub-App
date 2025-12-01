// src/firebase/auth.js
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* --------------------------
   REGISTER USER (STUDENTS ONLY)
--------------------------- */
export const registerUser = async (name, email, password) => {
  try {
    const emailTrimmed = email.trim().toLowerCase();

    if (!name || !emailTrimmed || !password) {
      return { success: false, error: "All fields are required." };
    }

    // ❌ Manager cannot register
    if (emailTrimmed === "manager@fjwu.edu.pk") {
      return { success: false, error: "Manager account is fixed and cannot register." };
    }

    // ✅ Allow student emails from all departments: xyz@cs.fjwu.edu.pk, xyz@ai.fjwu.edu.pk, etc.
    const studentEmailRegex = /^[a-zA-Z0-9.-]+@[a-z]{2,10}\.fjwu\.edu\.pk$/;
    if (!studentEmailRegex.test(emailTrimmed)) {
      return {
        success: false,
        error: "Only FJWU student emails (like xyz@cs.fjwu.edu.pk) are allowed.",
      };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, emailTrimmed, password);
    const user = userCredential.user;

    // Save profile in Firestore
    const profile = {
      uid: user.uid,
      name,
      email: emailTrimmed,
      role: "student",
      createdAt: new Date(),
    };
    await setDoc(doc(db, "users", user.uid), profile);

    localStorage.setItem("userRole", "student");

    return { success: true, user, data: profile };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* --------------------------
   LOGIN USER (STUDENTS & MANAGER)
--------------------------- */
export const loginUser = async (email, password) => {
  try {
    const emailTrimmed = email.trim().toLowerCase();

    if (!emailTrimmed || !password) {
      return { success: false, error: "Email and password are required." };
    }

    // ✅ Manager login only
    if (emailTrimmed === "manager@fjwu.edu.pk") {
      if (password !== "manager@123") {
        return { success: false, error: "Incorrect manager password." };
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, password);
      const user = userCredential.user;

      const profile = { uid: user.uid, name: "Manager", email: emailTrimmed, role: "manager" };
      localStorage.setItem("userRole", "manager");

      return { success: true, user, data: profile };
    }

    // ✅ Student login
    const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, password);
    const user = userCredential.user;

    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return { success: false, error: "Student not registered. Please register first." };
    }

    const profileData = profileSnapshot.data();
    localStorage.setItem("userRole", profileData.role || "student");

    return { success: true, user, data: profileData };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* --------------------------
   LOGOUT USER
--------------------------- */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userRole");
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* --------------------------
   FRIENDLY FIREBASE ERRORS
--------------------------- */
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
