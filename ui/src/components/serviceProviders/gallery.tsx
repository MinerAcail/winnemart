// import Image from "next/image"
import { Camera, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import img from "./data/img1.jpeg";

export function WorkGallery() {
  // Sample projects data
  const projects = [
    {
      id: 1,
      title: "Modern Apartment Renovation",
      category: "Residential",
      image: img,
      description: "Complete renovation of a 2-bedroom apartment with an open concept design.",
    },
    {
      id: 2,
      title: "Coastal Beach House",
      category: "Residential",
      image: img,
      description: "Interior design for a luxury beach house with ocean views.",
    },
    {
      id: 3,
      title: "Downtown Cafe Redesign",
      category: "Commercial",
      image: img,
      description: "Complete redesign of a popular downtown cafe.",
    },
    {
      id: 4,
      title: "Minimalist Home Office",
      category: "Residential",
      image: img,
      description: "Creating a functional and stylish home office space.",
    },
    {
      id: 5,
      title: "Boutique Hotel Lobby",
      category: "Commercial",
      image: img,
      description: "Redesign of a boutique hotel lobby and common areas.",
    },
    {
      id: 6,
      title: "Family Home Makeover",
      category: "Residential",
      image: img,
      description: "Complete interior makeover for a 4-bedroom family home.",
    },
  ]

  return (
    <div>
      <div className="mb-3 flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-center">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] rounded-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-2">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group overflow-hidden border-none bg-background/60 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                // fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-4 right-4 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-5">
              <div className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {project.category}
              </div>
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="outline" className="gap-2 rounded-full px-6">
          <Camera className="h-4 w-4" />
          View More Projects
        </Button>
      </div>
    </div>
  )
}

