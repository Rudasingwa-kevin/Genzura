interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-border-base shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-12 h-6 rounded-lg" />
      </div>
      <Skeleton className="w-24 h-3 mb-2" />
      <Skeleton className="w-16 h-10" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border-base">
      <td className="py-5 px-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      </td>
      <td className="py-5 px-8">
        <Skeleton className="w-24 h-6 rounded-full" />
      </td>
      <td className="py-5 px-8">
        <Skeleton className="w-28 h-4" />
      </td>
      <td className="py-5 px-8 text-center">
        <Skeleton className="w-8 h-8 rounded-xl mx-auto" />
      </td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">
      <div className="p-8 border-b border-border-base flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-48 h-3" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-20 h-10 rounded-xl" />
        </div>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-border-base">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
