"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function AlertDialogDemo() {
    const [termsAccepted, setTermsAccepted] = useState(false)


    function handleAccept() {
        setTermsAccepted(prev=>!prev)

    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Terms & Conditions</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Terms & Conditions</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please read our terms and conditions carefully before proceeding. By accepting, you agree to all the terms
                        outlined in our policy.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex items-center space-x-2 py-4">
                    <Switch id="terms" checked={termsAccepted} onCheckedChange={handleAccept} />
                    <Label htmlFor="terms" className="text-sm">
                        I accept the terms and conditions
                    </Label>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={!termsAccepted}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

