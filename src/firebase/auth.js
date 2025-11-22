// src/firebase/auth.js

import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

/* -------------------------------------------------------
   REGISTER USER (Auth + Firestore Profile)
------------------------------------------------------- */
export const registerUser = async (name, email, password, role) => {
  try {
    if (!name || !email || !password || !role) {
      return { success: false, error: "All fields are required." };
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Save profile to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   LOGIN USER
------------------------------------------------------- */
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    // Login user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Fetch user profile from Firestore
    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return { success: false, error: "User profile not found." };
    }

    return {
      success: true,
      user,
      data: profileSnapshot.data(),
    };
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
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   FRIENDLY FIREBASE ERROR MESSAGES
------------------------------------------------------- */
const mapAuthError = (error) => {
  const code = error.code;

  switch (code) {
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
