import { useEffect, useState } from "react"
import { Button } from "./button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card.tsx"

export function WelcomePopupCard() {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("welcomePopupClosed") !== "true"
  })

  useEffect(() => {
    if (!isVisible) return

    const timeout = setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem("welcomePopupClosed", "true")
    }, 7000)

    return () => clearTimeout(timeout)
  }, [isVisible])

  function handleClose() {
    setIsVisible(false)
    localStorage.setItem("welcomePopupClosed", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="relative">
          <CardTitle className="text-xl text-center text-primary">Welcome to Winnmart</CardTitle>
          <CardDescription className="text-center">Testing is over</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Thank you for your patience during our testing phase. We're now ready to serve you better!
          </p>
          <div className="grid place-items-center">
            <Button className="px-4 py-2 text-white rounded-lg" onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
