import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Bell, HelpCircle, User, LogOut, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearAuth, getStoredUser } from "@/lib/auth"
import { clearLegacyVmsLocalStorage } from "@/lib/vms-list-api"
import { getRoleDisplayLabel } from "@/lib/role-access"
import { isGlobalAdmin } from "@/lib/location-access"
import { locationLabel } from "@/lib/locations"
import { ROUTES } from "@/routes/config"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [searchInput, setSearchInput] = useState("")

  const handleLogout = () => {
    clearAuth()
    clearLegacyVmsLocalStorage()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const displayName = user?.username?.trim() || "User"
  const role = getRoleDisplayLabel(user?.role)
  const locationName = user?.location
    ? locationLabel(user.location)
    : isGlobalAdmin(user?.role)
      ? "All Locations"
      : ""
  const roleLine = locationName ? `${role} · ${locationName}` : role
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="fixed left-0 right-0 top-0 z-20 grid h-16 min-w-0 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-gray-100 bg-white px-2 sm:px-4 md:left-[333px] lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Search bar - rounded, light gray border */}
        <div className="flex min-w-0 flex-1 items-center rounded-[10px] border border-gray-200 bg-white py-2 pl-2 pr-2 sm:pl-4 sm:pr-3.5 md:max-w-[452px]">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search visitors, pass IDs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="text-[#4A5565] bg-transparent text-[15px] flex-1 min-w-0 py-1 border-0 outline-none placeholder:text-gray-400 ml-2"
          />
        </div>
      </div>

      <span className="shrink-0 px-2 text-center font-bold text-[#101727] text-sm sm:text-base">
        v1.0
      </span>

      <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
      {/* Notifications (bell with red dot) + Help */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
            aria-hidden
          />
        </button>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Vertical separator */}
      <div className="mx-1 h-8 w-px shrink-0 bg-gray-200 sm:mx-2" aria-hidden />

      {/* User profile: name, role, avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-lg py-1.5 pl-1 text-left transition-colors hover:bg-gray-50 sm:gap-3 sm:pl-2"
          >
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-[#101727] text-sm font-semibold">{displayName}</span>
              <span className="text-[#697282] text-xs">{roleLine}</span>
            </div>
            <Avatar className="h-10 w-10 rounded-full border-2 border-gray-100 shrink-0">
              <AvatarImage
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt={displayName}
              />
              <AvatarFallback className="bg-gray-200 text-[#6B7280] text-sm">
                {initials || <User className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  )
}
