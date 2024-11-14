interface TableProps {
  className?: string
  children: React.ReactNode
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function TableHeader({ className, children }: TableProps) {
  return <thead className={className}>{children}</thead>
}

export function TableBody({ className, children }: TableProps) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>
}

export function TableRow({ className, children }: TableProps) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`}>{children}</tr>
}

export function TableHead({ className, children }: TableProps) {
  return <th className={`h-12 px-4 text-left align-middle font-medium ${className}`}>{children}</th>
}

export function TableCell({ className, children }: TableProps) {
  return <td className={`p-4 align-middle ${className}`}>{children}</td>
} 