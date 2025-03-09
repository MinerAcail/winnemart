"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}

const InputWithButton: React.FC<SearchProps> = ({ isExpanded, setIsExpanded }) => {

    const [searchValue, setSearchValue] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Handle click outside to collapse
    useEffect(() => {
        if (!isExpanded) return

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsExpanded(false)
                setSearchValue("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isExpanded])

    // Auto-focus input when expanding
    useEffect(() => {
        if (isExpanded) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isExpanded])

    const toggleSearch = () => {
        setIsExpanded((prev) => !prev)
        if (isExpanded) {
            setSearchValue("")
        }
    }

    return (
        <div ref={containerRef} className="mr-10 flex items-center">

            <div
                className={`
                    flex items-center overflow-hidden rounded-md border transition-all duration-300 ease-out
                    ${isExpanded ? "w-65 border shadow-sm " : "w-12 border-transparent"}
                `}
            >
                <div
                    className={`
                        flex items-center w-full transition-opacity duration-200 
                        ${isExpanded ? "opacity-100" : "opacity-0"}
                    `}
                    style={{
                        transform: isExpanded ? "translateX(0)" : "translateX(-10px)",
                        transition: "transform 300ms ease-out, opacity 200ms ease-out",
                    }}
                >
                    <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="border-0 pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 m-1 p-4"
                    />
                </div>
            </div>

            <Button
                type="button"
                size="icon"
                variant={isExpanded ? "ghost" : "default"}
                onClick={toggleSearch}
                className={`transition-all duration-300 ease-out ${isExpanded ? "absolute right-0 text-muted-foreground hover:text-foreground" : ""}`}
                aria-label={isExpanded ? "Close search" : "Open search"}
            >
                <div className="relative w-4 h-4">
                    <Search className={`transition-all duration-300 ease-out ${isExpanded ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"}`} />
                    <X className={`absolute inset-0 h-4 w-4 transition-all duration-300 ease-out ${isExpanded ? "scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"}`} />
                </div>
            </Button>


        </div>
    )
}

export default InputWithButton
