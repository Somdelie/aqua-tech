"use server"

import type { LoginFormValues } from "@/components/auth/login"
import type { RegisterFormValues } from "@/components/auth/signup"
import { auth } from "@/lib/auth"
import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import db from '@/prisma/db';

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

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true, // Assuming role is a field in your user model
      },
    })
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

interface EditUserFormValues {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "USER" | "ADMIN" // Assuming these are your roles from the enum
}

export async function editUser(prevState: any, data: FormData) {
  const id = data.get("id") as string
  const email = data.get("email") as string
  const firstName = data.get("firstName") as string
  const lastName = data.get("lastName") as string
  const role = data.get("role") as "USER" | "ADMIN"

  try {
    await db.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, // Update full name
        role,
      },
    })
    revalidatePath("/dashboard/settings/users") // Revalidate the page to show updated data
    return { success: true, message: "User updated successfully!" }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, message: "Failed to update user." }
  }
}
