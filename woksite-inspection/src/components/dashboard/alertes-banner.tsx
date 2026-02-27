interface AlertesBannerProps {
  totalEcartsEnRetard: number;
}

export function AlertesBanner({ totalEcartsEnRetard }: AlertesBannerProps) {
  if (totalEcartsEnRetard === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-lg font-bold">!</span>
        </div>
        <div>
          <p className="font-semibold text-red-800">
            {totalEcartsEnRetard} écart{totalEcartsEnRetard > 1 ? "s" : ""} en
            retard
          </p>
          <p className="text-sm text-red-600">
            Délai de résolution dépassé — action requise
          </p>
        </div>
      </div>
    </div>
  );
}
