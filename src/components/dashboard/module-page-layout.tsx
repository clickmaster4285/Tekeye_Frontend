import React from "react"
import { Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ROUTES } from "@/routes/config"

export interface BreadcrumbItemType {
  label: string
  href?: string
}

interface ModulePageLayoutProps {
  title: string
  description: string
  breadcrumbs?: BreadcrumbItemType[]
  children: React.ReactNode
}

export function ModulePageLayout({
  title,
  description,
  breadcrumbs = [],
  children,
}: ModulePageLayoutProps) {
  return (
    <div className="min-w-0 max-w-full">
      <Breadcrumb className="mb-4 max-w-full overflow-x-auto">
        <BreadcrumbList className="min-w-max">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.DASHBOARD}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((item, i) => (
            <React.Fragment key={i}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="text-[#3b82f6] font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6 min-w-0">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
