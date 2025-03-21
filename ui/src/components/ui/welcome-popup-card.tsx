"use client"

import { useEffect, useState } from "react"

import { Button } from "./button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card.tsx"

export function WelcomePopupCard() {
  const [isVisible, setIsVisible] = useState(true)



  function handling(){
    setIsVisible(!isVisible)
  }
  useEffect(() => {
    // Set a timeout to hide the card after 7 seconds
   setTimeout(() => {
      setIsVisible(false)
    }, 7000)

    // Update the countdown timer every second
  
  }, [])


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
          <div className="grid place-items-center ">
            <Button className={"px-4 py-2  text-white rounded-lg"} onClick={handling}>
              Close
            </Button>
          </div>

        </CardContent>

      
      </Card>
    </div>
  )
}

