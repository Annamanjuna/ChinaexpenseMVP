import { PEOPLE, PEOPLE_COUNT, SHARED_PAYER } from "@/lib/constants";
import type {
  DayHistoryRow,
  Expense,
  ExpensePayer,
  PersonAmount,
  PersonName,
  SplitSummary,
  TripSettings,
} from "@/types";

function toVnd(cny: number, rate: number): number {
  return Math.round(cny * rate);
}

export function isSharedPayer(p: ExpensePayer): boolean {
  return p === SHARED_PAYER;
}

export function payerLabel(p: ExpensePayer): string {
  if (isSharedPayer(p)) return "Общее";
  return p;
}

/** Сумма на каждого: личные расходы + 1/3 от всех «Общее» */
export function computeSplitSummary(
  expenses: Expense[],
  rate: number
): SplitSummary {
  let grossCny = 0;
  let sharedCny = 0;
  const personal: Record<PersonName, number> = {
    Anna: 0,
    Kostya: 0,
    Taya: 0,
  };

  for (const e of expenses) {
    grossCny += e.amountCny;
    if (isSharedPayer(e.person)) {
      sharedCny += e.amountCny;
    } else {
      personal[e.person as PersonName] += e.amountCny;
    }
  }

  const shareEach = sharedCny / PEOPLE_COUNT;

  const perPerson: PersonAmount[] = PEOPLE.map((person) => {
    const cny = Math.round((personal[person] + shareEach) * 100) / 100;
    return {
      person,
      cny,
      vnd: toVnd(cny, rate),
    };
  });

  return {
    grossCny: Math.round(grossCny * 100) / 100,
    grossVnd: toVnd(grossCny, rate),
    sharedCny: Math.round(sharedCny * 100) / 100,
    sharedVnd: toVnd(sharedCny, rate),
    perPerson,
  };
}

/** История по дням внутри поездки */
export function computeHistoryByDay(
  expenses: Expense[],
  settings: TripSettings
): DayHistoryRow[] {
  const rate = settings.cnyToVndRate;
  const inTrip = expenses.filter(
    (e) => e.date >= settings.tripStart && e.date <= settings.tripEnd
  );

  const dates = [...new Set(inTrip.map((e) => e.date))].sort((a, b) =>
    b.localeCompare(a)
  );

  return dates.map((date) => {
    const dayExpenses = inTrip.filter((e) => e.date === date);
    const split = computeSplitSummary(dayExpenses, rate);
    return {
      date,
      grossCny: split.grossCny,
      grossVnd: split.grossVnd,
      perPerson: split.perPerson,
    };
  });
}

/** Доля одного человека от суммы «Общее» */
export function sharedPerPerson(amountCny: number): number {
  return Math.round((amountCny / PEOPLE_COUNT) * 100) / 100;
}
