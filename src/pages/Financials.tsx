import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getJobIncome, type IncomeTotals } from "../api/jobsAPI";

const periodOptions = ["Month", "Year"] as const;
const incomeViews = ["Earned", "Paid", "Unpaid"] as const;
type Period = (typeof periodOptions)[number];
type IncomeView = (typeof incomeViews)[number];
type Report = Awaited<ReturnType<typeof getJobIncome>> | { error: string };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatIncome({ paidCents, unpaidCents }: IncomeTotals, view: IncomeView) {
  if (view === "Earned") return currency.format((paidCents + unpaidCents) / 100);
  return currency.format((view === "Paid" ? paidCents : unpaidCents) / 100);
}

function IncomeReport({
  year,
  month,
  incomeView,
  onIncomeViewChange,
}: {
  year: number;
  month: number | null;
  incomeView: IncomeView;
  onIncomeViewChange: (view: IncomeView) => void;
}) {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const startDate = new Date(year, month ?? 0, 1);
    const endDate = new Date(year, month === null ? 12 : month + 1, 0);

    async function loadReport() {
      try {
        const income = await getJobIncome(startDate, endDate, controller.signal);
        if (!controller.signal.aborted) setReport(income);
      } catch (err) {
        if (!controller.signal.aborted) {
          setReport({
            error:
              err instanceof Error ? err.message : "Failed to load job income",
          });
        }
      }
    }

    void loadReport();
    return () => controller.abort();
  }, [year, month]);

  if (!report) {
    return <p role="status" className="text-gray-500">Loading...</p>;
  }
  if ("error" in report) {
    return <p role="alert" className="text-red-600">{report.error}</p>;
  }

  const { clientTotals, totals } = report;

  return (
    <>
      <div
        role="group"
        aria-label="Income totals and client view"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200"
      >
        {incomeViews.map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={incomeView === view}
            aria-controls="income-by-client"
            onClick={() => onIncomeViewChange(view)}
            className={`cursor-pointer p-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-green-600 ${
              view === "Earned" ? "col-span-2" : ""
            } ${
              incomeView === view
                ? "bg-green-50 text-green-700"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="block text-sm font-medium">
              {view === "Earned" ? "Total earned" : view}
            </span>
            <span
              className={`mt-1 block wrap-anywhere tabular-nums text-gray-900 ${
                view === "Earned" ? "text-2xl font-bold" : "text-lg font-semibold"
              }`}
            >
              {formatIncome(totals, view)}
            </span>
          </button>
        ))}
      </div>

      <section
        id="income-by-client"
        aria-labelledby="income-by-client-title"
        className="space-y-3"
      >
        <h3
          id="income-by-client-title"
          className="text-lg font-semibold text-gray-900"
        >
          Income by client
        </h3>
        {clientTotals.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            No completed jobs for this period.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table
              className="min-w-full divide-y divide-gray-200"
              aria-labelledby="income-by-client-title"
            >
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left font-medium md:px-4"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-medium md:px-4"
                  >
                    Completed jobs
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-medium md:px-4"
                  >
                    {incomeView}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm">
                {clientTotals.map((client) => (
                  <tr
                    key={client.id ?? "unknown-client"}
                    className="hover:bg-gray-50"
                  >
                    <th
                      scope="row"
                      className="wrap-anywhere px-3 py-3 text-left font-medium text-gray-900 md:px-4"
                    >
                      {client.name}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 md:px-4">
                      {client.completedJobs}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium tabular-nums text-gray-900 md:px-4">
                      {formatIncome(client, incomeView)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default function Financials() {
  const [period, setPeriod] = useState<Period>("Month");
  const [incomeView, setIncomeView] = useState<IncomeView>("Earned");
  const [date, setDate] = useState(() => new Date());
  const year = date.getFullYear();
  const month = period === "Month" ? date.getMonth() : null;
  const periodLabel = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: month === null ? undefined : "long",
  });

  function changePeriod(offset: number) {
    setDate((current) => {
      const year = current.getFullYear();
      const month = current.getMonth();
      return period === "Month"
        ? new Date(year, month + offset, 1)
        : new Date(year + offset, month, 1);
    });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financials</h1>
        <div
          role="group"
          aria-label="View by"
          className="flex gap-1 rounded-lg bg-gray-100 p-1"
        >
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              onClick={() => setPeriod(option)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                period === option
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <section aria-labelledby="income-period" className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => changePeriod(-1)}
            aria-label={`Previous ${period.toLowerCase()}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <h2
            id="income-period"
            aria-live="polite"
            className="text-lg font-semibold text-gray-900"
          >
            {periodLabel}
          </h2>
          <button
            type="button"
            onClick={() => changePeriod(1)}
            aria-label={`Next ${period.toLowerCase()}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <IncomeReport
          key={`${year}-${month}`}
          year={year}
          month={month}
          incomeView={incomeView}
          onIncomeViewChange={setIncomeView}
        />
      </section>
    </div>
  );
}
