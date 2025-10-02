"use client";

import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Search, label: "Discover", href: "/discover" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Heart, label: "Activity", href: "/activity" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNavigation() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 z-40">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          const isProfile = label === "Profile";

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] ${
                isActive ? "text-white" : "text-gray-500"
              } transition-colors`}
            >
              {isProfile && user?.imageUrl ? (
                <div
                  className={`relative w-7 h-7 rounded-full border-2 ${
                    isActive ? "border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                    sizes="28px"
                  />
                </div>
              ) : (
                <Icon
                  className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`}
                  fill={isActive ? "currentColor" : "none"}
                />
              )}
              <span
                className={`text-xs mt-1 ${isActive ? "text-white" : "text-gray-500"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
