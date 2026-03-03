"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { usePathname } from "next/navigation"

export function Header() {
    const [user, setUser] = useState<User | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
        })
        return () => unsubscribe()
    }, [])

    const handleLogout = async () => {
        await signOut(auth)
    }

    // Don't show the global header on admin routes since they have their own layout
    if (pathname?.startsWith('/admin')) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <div className="rounded-full bg-primary/20 p-1">
                            <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <span className="hidden font-bold sm:inline-block tracking-tight text-lg">
                            SaaS<span className="text-primary">Waitlist</span>
                        </span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:inline-block">
                                    Dashboard
                                </Link>
                                <Button size="sm" variant="ghost" onClick={handleLogout} className="hidden sm:flex text-muted-foreground hover:text-foreground">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Link href="/signin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:inline-block">
                                Sign In
                            </Link>
                        )}
                        <Link href="/projects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:inline-block">
                            Explore
                        </Link>
                        <Link href="/admin/new">
                            <Button size="sm" className="hidden sm:flex rounded-full px-4">Submit Project</Button>
                        </Link>
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}
