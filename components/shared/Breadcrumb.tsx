import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto whitespace-nowrap hide-scrollbar">
      <ol className="flex items-center text-sm text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              <Link
                href={item.href}
                className={`flex items-center hover:text-primary transition-colors ${
                  isLast ? "text-gray-900 font-semibold pointer-events-none" : ""
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {index === 0 && item.href === "/" && (
                  <Home size={14} className="mr-1.5 mb-0.5" />
                )}
                {item.label}
              </Link>
              {!isLast && (
                <ChevronRight size={14} className="mx-2 flex-shrink-0 text-gray-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
