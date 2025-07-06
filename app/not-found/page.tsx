"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Redirect to search results or home with query
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
    setIsLoading(false)
  }

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  // Floating animation for the 404 text
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  }

  // Stagger animation for content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 4,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Number */}
        <motion.div className="mb-8" animate={floatingAnimation}>
          <motion.h1
            className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Main heading */}
        <motion.h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4" variants={itemVariants}>
          Oops! Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p className="text-lg text-gray-600 mb-8 leading-relaxed" variants={itemVariants}>
          The page you're looking for seems to have vanished into the digital void. Don't worry, even the best explorers
          sometimes take a wrong turn.
        </motion.p>

        {/* Search form */}
        <motion.form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto" variants={itemVariants}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for what you need..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full py-3 transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </motion.form>

        {/* Action buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-200 rounded-full px-6 py-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Go Back
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full px-6 py-3 transition-all duration-200 transform hover:scale-105"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Helpful links */}
        <motion.div className="mt-12 pt-8 border-t border-gray-200" variants={itemVariants}>
          <p className="text-sm text-gray-500 mb-4">Maybe you were looking for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              Our Services
            </Link>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              Contact
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}