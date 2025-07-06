"use server"

import type { LoginFormValues } from "@/components/auth/login"
import type { RegisterFormValues } from "@/components/auth/signup"
import { auth } from "@/lib/auth"
import { APIError } from "better-auth/api"
import { headers } from "next/headers"

export async function registerUser(data: RegisterFormValues) {
  try {
    console.log(data)

    // Call the register api with auto sign-in
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      headers: await headers(), // Pass headers for session management
    })

    return {
      success: true,
      data: result,
      message: "Registration successful! You are now logged in.",
      error: null,
    }
  } catch (error) {
    console.log(error)
    if (error instanceof APIError) {
      console.log(error.message, error.status)
      if (error.status === "UNPROCESSABLE_ENTITY") {
        return {
          success: false,
          data: null,
          error: error.message,
          message: error.message,
          status: error.status,
        }
      }
    }
    return {
      success: false,
      data: null,
      error: "Something went wrong",
      message: "Something went wrong during registration",
    }
  }
}

export async function loginUser(data: LoginFormValues) {
  try {
    console.log(data)

    // Call the login api
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      headers: await headers(), // Pass headers for session management
    })

    return {
      success: true,
      data: result,
      message: "Login successful!",
      error: null,
    }
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
      if (error.status === "UNAUTHORIZED") {
        return {
          success: false,
          data: null,
          error: error.message,
          message: error.message,
          status: error.status,
        }
      }
    }
    return {
      success: false,
      data: null,
      error: "Something went wrong",
      message: "Something went wrong during login",
    }
  }
}
