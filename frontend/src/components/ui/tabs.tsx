import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

interface NavigationTab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface NavigationTabsProps {
  tabs: NavigationTab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

const Tabs = ({ tabs, activeTab, onChange, className }: NavigationTabsProps) => (
  <div
    role="tablist"
    className={cn(
      "flex flex-wrap items-center gap-1 rounded-lg border border-[#30363d] bg-[#161b22] p-1",
      className
    )}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff]",
          activeTab === tab.id
            ? "bg-[#21262d] text-[#c9d1d9] shadow"
            : "text-[#8b949e] hover:bg-[#21262d]/60 hover:text-[#c9d1d9]"
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-[#161b22] p-1 border border-[#30363d]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] disabled:pointer-events-none disabled:opacity-50 text-[#8b949e] data-[state=active]:bg-[#21262d] data-[state=active]:text-[#c9d1d9] data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-[#0d0f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
