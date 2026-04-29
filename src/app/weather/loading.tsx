export default function WeatherLoading() {
  return (
    <div className="space-y-6">
      <section className="glass-card animate-fade-up p-6 sm:p-8">
        <div className="h-5 w-40 animate-pulse rounded bg-green-100" />
        <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-green-100" />
        <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-green-100" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="glass-card h-28 animate-pulse bg-green-50" />
        ))}
      </section>

      <section className="glass-card h-64 animate-pulse bg-green-50" />
    </div>
  );
}
