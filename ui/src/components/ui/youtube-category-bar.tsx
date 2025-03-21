"use client"

import { useRef, useState, useEffect } from "react"


const categories = [
  "All",
  "Computer Hardware",
  "Music",
  "Dramedy",
  "DC Comics",
  "Live",
  "Computers",
  "Gaming",
  "JavaScript",
  "React",
  "Next.js",
  "CSS",
  "Web Development",
  "UI Design",
  "Tutorials",
  "Comedy",
]

export default function YouTubeCategoryBar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")

  const checkScroll = () => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      // Initial check
      checkScroll()

      return () => container.removeEventListener("scroll", checkScroll)
    }
  }, [])



  return (
      <div className=" fixed right-0 w-screen overflow-hidden  py-2 m-2 bg-white rounded-2xl">
        {/* Left arrow button */}
        {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
              <div className="h-full w-12 "></div>

            </div>
        )}

        {/* Scrollable container */}
        <div ref={containerRef} className="flex space-x-3 overflow-x-auto px-4 scrollbar-hide" onScroll={checkScroll}>
          {categories.map((category) => (
              <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-lg m-1 px-4 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      category === activeCategory ? "bg-green-300" : "bg-neutral-700 text-white hover:bg-neutral-700"
                  }`}
              >
                {category}
              </button>
          ))}
        </div>

        {/* Right arrow button */}
        {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
              <div className="h-full w-16 "></div>

            </div>
        )}
      </div>
  )
}

