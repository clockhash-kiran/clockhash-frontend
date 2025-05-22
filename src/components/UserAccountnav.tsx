"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LogOut, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
// You'll need to create this hook

const refreshAuthToken = async () => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    return data.refreshToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    signOut(); // Logout if refresh fails
  }
};

const UserAccountNav = () => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshAuthToken();
      },
      55 * 60 * 1000
    ); // Refresh every 55 minutes

    return () => clearInterval(interval);
  }, []);

  const accountMenuItems = [
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      variant: "secondary" as const,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      variant: "secondary" as const,
    },
  ];

  const handleSignOut = () => {
    signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/sign-in`,
    });
  };

  if (isDesktop) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full text-white"
          >
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accountMenuItems.map((item) => (
            <DropdownMenuItem key={item.label} asChild>
              <Link href={item.href} className="w-full">
                <Button variant={item.variant} className="w-full justify-start">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5 " />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>My Account</DrawerTitle>
          <DrawerClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DrawerClose>
        </DrawerHeader>

        <div className="grid gap-4 px-4 py-2">
          {accountMenuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <Button variant={item.variant} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <DrawerFooter>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserAccountNav;
