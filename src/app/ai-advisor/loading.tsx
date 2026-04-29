export default function AiAdvisorLoading() {
  return (
    <div className="space-y-6">
      <section className="glass-card animate-fade-up p-6 sm:p-8">
        <div className="h-5 w-32 animate-pulse rounded bg-green-100" />
        <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-green-100" />
        <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-green-100" />
      </section>

      <section className="glass-card animate-fade-up p-4 sm:p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-green-100" />
        <div className="mt-4 h-[24rem] animate-pulse rounded-2xl bg-green-50" />
      </section>
    </div>
  );
}
