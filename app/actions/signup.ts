"use server";

import { auth } from "@/auth";

interface SignupParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function signup(params: SignupParams) {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: `${params.firstName} ${params.lastName}`,
        email: params.email,
        password: params.password,
      },
      asResponse: true,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Sign up failed:", error);
      return { success: false, error: error.message || "Failed to create account" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error signing up:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create account";
    return { success: false, error: errorMessage };
  }
}
