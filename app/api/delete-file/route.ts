import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://www.aquatechmobiles.co.za",
  process.env.BETTER_AUTH_URL || "http://localhost:3000",
].filter(Boolean)

function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")

  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const corsHeaders = getCorsHeaders(origin)

  try {
    const body = await request.json()
    const { fileUrl } = body

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    // Validate that this is a Vercel Blob URL
    if (!fileUrl.includes("blob.vercel-storage.com")) {
      return NextResponse.json(
        { error: "Invalid file URL format. Must be a Vercel Blob URL." },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    try {
      // Delete the file using Vercel Blob
      await del(fileUrl)

      return NextResponse.json(
        { success: true, message: "File deleted successfully" },
        {
          status: 200,
          headers: corsHeaders,
        },
      )
    } catch (error) {
      console.error("Error deleting file from Vercel Blob:", error)

      if (error instanceof Error) {
        // Handle specific Vercel Blob errors
        if (
          error.message.includes("not found") ||
          error.message.includes("does not exist") ||
          (error as any).code === "blob_not_found"
        ) {
          return NextResponse.json(
            {
              success: true,
              message: "File did not exist or was already deleted",
            },
            {
              status: 200,
              headers: corsHeaders,
            },
          )
        }

        // Handle unauthorized access
        if (
          error.message.includes("unauthorized") ||
          error.message.includes("forbidden") ||
          (error as any).code === "unauthorized"
        ) {
          return NextResponse.json(
            { error: "Unauthorized to delete this file" },
            {
              status: 403,
              headers: corsHeaders,
            },
          )
        }
      }

      throw error
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error deleting file",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}
