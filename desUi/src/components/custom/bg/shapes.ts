// Define the color scheme
export const colors = ["#4569B4", "#4F8382", "#C590BE", "#F58024", "#EE4C30", "#FDB627", "#F0D29E", "#000000"]

// Define a background color
export const backgroundColor = "#FFFFFF" // White background

// Function to generate a random quail-like loop shape
export function generateQuailShape(): string {
  const size = 100
  const points = []
  const numPoints = Math.floor(Math.random() * 5) + 5 // 5 to 9 points

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2
    const radius = (size / 2) * (0.5 + Math.random() * 0.5) // Vary the radius
    const x = size / 2 + Math.cos(angle) * radius
    const y = size / 2 + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  }

  return `M${points.join(" L")}Z`
}

