import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { formatTimestamp } from "./format-time-stamp";

export const addHumanReadableTimesToThreads = (rawThreads: any) => {
  const groups: Record<string, { title: string }[]> = {};

  for (const thread of rawThreads) {
    const createdAt = new Date(thread.createdAtTimeStamp);
    let dateLabel: string;

    if (isToday(createdAt)) {
      dateLabel = "Tänään";
    } else if (isYesterday(createdAt)) {
      dateLabel = "Eilen";
    } else {
      const daysDiff = differenceInDays(new Date(), createdAt);

      if (daysDiff <= 7) {
        dateLabel = "7 Päivää";
      } else if (daysDiff <= 30) {
        dateLabel = "30 Päivää";
      } else {
        dateLabel = format(createdAt, "yyyy-MM"); // group older into YYYY-MM
      }
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }

    groups[dateLabel].push({
      title: formatTimestamp(thread.createdAtTimeStamp),
      ...thread,
    });
  }

  // 🆕 Sort threads within each group: newest first
  for (const group of Object.values(groups)) {
    group.sort(
      (a: any, b: any) =>
        new Date(b.createdAtTimeStamp).getTime() -
        new Date(a.createdAtTimeStamp).getTime()
    );
  }

  // ✅ Sort date groups: Tänään > Eilen > 7 Päivää > 30 Päivää > older
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const priority = (label: string) => {
      if (label === "Tänään") return 5;
      if (label === "Eilen") return 4;
      if (label === "7 Päivää") return 3;
      if (label === "30 Päivää") return 2;
      return 1; // months get lowest priority
    };

    const pA = priority(a);
    const pB = priority(b);

    if (pA !== pB) return pB - pA;
    return b.localeCompare(a); // for YYYY-MM
  });

  return sortedKeys.map((date) => ({
    date,
    chats: groups[date],
  }));
};

// return data example = [
//   {
//     date: 'Today',
//     chats: [
//       { title: 'How many cars' },
//       { title: 'What is today' },
//       {
//         title:
//           'How much rock weighs in dirt road over seasmuch rock weighs in dirt road over seas',
//       },
//     ],
//   },]
