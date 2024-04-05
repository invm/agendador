import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import { Person, Station } from "./components/Grid";
import { newDate } from "./utils/utils";

const TF = "HH:mm";

export type InputStation = Station & {
  start: number;
  end: number;
};

const MIN_REST = 4; // in minutes
// const END_DAYS = 7;
const TIME_FORMAT = "DD/MM HH:mm";

const WEIGHT_REST = 1;
// const WEIGHT_SAME_PERSON = -4;
// const WEIGHT_SAME_HOUR = -4;

type Shift = {
  minPeople: number;
  startTime: Dayjs;
  name: string;
  start: string;
  onDuty: Person[];
  shiftTime: number;
};

type getCostArgs = {
  person: Person;
  shifts: Shift[];
  startTime: Dayjs;
  minPeople: number;
  onDuty: Person[];
  shiftTime: number;
};

const getCost = (args: getCostArgs) => {
  const {
    person,
    shifts,
    startTime,
    // minPeople,
    onDuty,
    shiftTime,
  } = args;
  const lastShifts = _.filter(
    _.reverse(_.cloneDeep(shifts)),
    (shift: Shift) => !!_.find(shift.onDuty, { id: person.id }),
  );
  if (_.find(onDuty, { id: person.id }))
    return { cost: -Infinity, restPeriod: 0 };
  if (!lastShifts.length) return { cost: Infinity, restPeriod: 0 };
  const restPeriod = startTime.diff(lastShifts[0].startTime, "m") - shiftTime;
  // const sameShiftHour = startTime.get("h") === lastShifts[0].startTime.get("h");
  // const sameShiftPersons =
  //   onDuty.length < minPeople && onDuty.length > 0
  //     ? _.find(lastShifts, (s) => _.find(s.onDuty, { id: onDuty[0].id }))
  //     : false;
  // const totalRestTime = 0 // TODO v2: sum time between shifts
  const totalShifts = lastShifts.length;
  const totalRest = lastShifts.reduce(
    (acc: number, curr: Shift, i: number, arr: Shift[]) => {
      if (i === 0) {
        return acc;
      }
      const prev = arr[i - 1];
      return acc + curr.startTime.diff(prev.startTime, "m") - shiftTime;
    },
    0,
  );
  if (restPeriod < MIN_REST) {
    return { cost: -Infinity, restPeriod, totalShifts, totalRest };
  }
  const restCost = restPeriod * WEIGHT_REST;
  // const sameHourCost = sameShiftHour ? WEIGHT_SAME_HOUR : 0;
  // const samePersonCost = sameShiftPersons ? WEIGHT_SAME_PERSON : 0;

  const sameHourCost = 0;
  const samePersonCost = 0;

  return {
    cost: restCost + sameHourCost + samePersonCost,
    restPeriod,
    totalShifts,
    totalRest,
  };
};

type populateOnDutyProps = {
  startTime: Dayjs;
  people: Person[];
  shifts: Shift[];
  minPeople: number;
  onDuty: Person[];
  shiftTime: number;
};

const populateOnDuty = ({
  startTime,
  people,
  shifts,
  minPeople,
  onDuty,
  shiftTime,
}: populateOnDutyProps) => {
  while (onDuty.length < minPeople) {
    people = people.map((person) => {
      const { cost, restPeriod, totalShifts } = getCost({
        startTime,
        person,
        shifts,
        minPeople,
        onDuty,
        shiftTime,
      });
      return {
        ...person,
        cost,
        restPeriod,
        totalShifts,
        rest: person.rest ? person.rest + restPeriod : restPeriod,
      };
    });
    people = _.orderBy(
      people,
      ["cost", "totalShifts", "totalRest"],
      ["desc", "asc", "desc"],
    );
    onDuty.push(_.first(people)!);
  }
  // const v = validShift(shifts, onDuty);
};

type shouldPopulateShiftProps = {
  scheduleStart: Dayjs;
  current: Dayjs;
  shiftTime: number;
};

const shouldPopulateShift = ({
  scheduleStart,
  current,
  shiftTime,
}: shouldPopulateShiftProps) => {
  const a =
    ((current.valueOf() - scheduleStart.startOf("d").valueOf()) / 60000) %
    shiftTime;

  return a === 0;
  // FIX: this probably does not wwork now
  // const h = scheduleStartTime.get("h");
  // if (start === end && (h - start) % shiftTime === 0) {
  //   return true;
  // } else if (
  //   start > end &&
  //   (h >= start || h < end) &&
  //   (h - start) % shiftTime === 0
  // ) {
  //   return true;
  // } else if (h >= start && h < end) {
  //   if ((h - start) % shiftTime === 0) {
  //     return true;
  //   }
  //   return false;
  // }
  // return false;
};

const getCommonDenominator = (arr: number[]) => {
  const gcd = (a: number, b: number): number => {
    if (b === 0) {
      return a;
    }
    return gcd(b, a % b);
  };
  return arr.reduce((acc, curr) => gcd(acc, curr), 0);
};

const analyzeStations = (stations: InputStation[]) => {
  // the step will always be the lowest shift time between
  const [scheduleStart, scheduleEnd, steps] = stations.reduce(
    ([min, max, steps], curr) => {
      if (dayjs(curr.start, TF).isBefore(min)) {
        min = dayjs(curr.start, TF);
      }
      if (dayjs(curr.start, TF).isAfter(max)) {
        max = dayjs(curr.start);
      }
      steps.push(curr.shiftTime);
      return [min, max, steps];
    },
    [
      dayjs(stations[0].start, TF),
      dayjs(stations[0].start, TF),
      [] as number[],
    ],
  );
  const commonDenominator = getCommonDenominator(steps);
  return { scheduleStart, scheduleEnd, step: commonDenominator };
};

const generate = ({ stations, people, days }: GenerateProps) => {
  const shifts: Shift[] = [];
  const { scheduleEnd, scheduleStart, step } = analyzeStations(stations);
  let s = scheduleStart;

  // TODO: concat to already provided input and change start to be the start of input
  const endTime = newDate(
    dayjs(),
    scheduleEnd.get("h"),
    scheduleEnd.get("m"),
  ).add(days, "d");

  while (s.isBefore(endTime)) {
    // TODO: add randomness element and keep track for next cycle to not fuck the same person again
    for (let i = 0; i < stations.length; i++) {
      // TODO: use start and end to not populate shifts at downtimes
      const { minPeople, name, shiftTime } = stations[i];
      // it is initial because it will change in case the same people
      const should = shouldPopulateShift({
        scheduleStart,
        current: s,
        shiftTime,
      });
      if (should) {
        const shift = {
          // start: scheduleStartTime.format(TIME_FORMAT),
          start: s.format(TIME_FORMAT),
          startTime: s,
          name,
          minPeople,
          shiftTime,
          onDuty: [],
        };
        shifts.push(shift);
      }
    }

    s = s.add(step, "m");
  }

  console.log({ shifts });

  const allShifts = [];

  for (let i = 0; i < shifts.length; i++) {
    const { minPeople, shiftTime, startTime, ...shift } = shifts[i];
    const onDuty: Person[] = [];
    populateOnDuty({
      startTime,
      people,
      shifts: allShifts,
      minPeople,
      onDuty,
      shiftTime,
    });
    allShifts.push({
      ...shift,
      onDuty,
      shiftTime,
      startTime,
      minPeople,
    });
  }
  console.log({ allShifts });

  return allShifts;
};

// const printMetrics = (shifts) => {
//   let metrics = {},
//     minRest = Infinity,
//     maxRest = 0,
//     totalShifts = [];
//
//   shifts.forEach((shift) => {
//     shift.onDuty.forEach((p) => {
//       if (!metrics[p.id]) {
//         metrics[p.id] = {
//           shifts: [],
//         };
//       }
//       metrics[p.id]["shifts"].push({
//         startTime: shift.startTime,
//         shiftTime: shift.shiftTime,
//       });
//     });
//   });
//   Object.keys(metrics).forEach((id) => {
//     metrics[id]["rest"] = metrics[id]["shifts"].reduce((acc, curr, i, arr) => {
//       if (i === 0) {
//         return acc;
//       }
//       const prev = arr[i - 1];
//       const restPeriod =
//         curr.startTime.diff(prev.startTime, "h") - prev.shiftTime;
//       if (restPeriod < minRest) {
//         minRest = restPeriod;
//       }
//       if (restPeriod > maxRest) {
//         maxRest = restPeriod;
//       }
//       acc.push(`${prev.shiftTime}-${restPeriod}`);
//       if (i === arr.length - 1) {
//         const total = arr.reduce((acc, curr, i, arr) => {
//           if (i === 0) {
//             return acc;
//           }
//           const prev = arr[i - 1];
//           return (
//             acc + curr.startTime.diff(prev.startTime, "h") - prev.shiftTime
//           );
//         }, 0);
//         const average = total / (arr.length - 1);
//         acc["id"] = id;
//         acc["total"] = total;
//         acc["shifts"] = arr.length;
//         acc["average"] = +average.toFixed(1);
//         totalShifts.push(arr.length);
//       }
//       return acc;
//     }, []);
//     delete metrics[id]["shifts"];
//   });
//   const rests = Object.keys(metrics).map((id) => metrics[id].rest);
//   console.table(rests);
//   console.log("minRest", minRest);
//   console.log("maxRest", maxRest);
//   console.log("totalShifts:", totalShifts);
// };
//
// const printShifts = (shifts) => {
//   console.table(
//     _.cloneDeep(shifts).map((s) => {
//       s.onDuty = s.onDuty.map((p) => p.name);
//       delete s.shiftTime;
//       delete s.startTime;
//       return s;
//     }),
//   );
// };

const generateCsv = (shifts: Shift[], stations: Station[]) => {
  let csv = "time,";
  const headers: string[] = [];
  stations.forEach((station: Station) => {
    for (let i = 1; i <= station.minPeople; i++) {
      headers.push(`${station.name}-${i}`);
    }
  });
  csv += headers.join(",") + "\n";
  const grouped = _.groupBy(shifts, (s: Shift) =>
    s.startTime.format(TIME_FORMAT),
  );
  Object.keys(grouped).forEach((time) => {
    csv += `${time},`;
    const shift: string[] = [];
    stations.forEach((station: Station) => {
      for (let i = 1; i <= station.minPeople; i++) {
        const person = grouped[time].find(
          (s: Shift) => s.name === station.name && s.onDuty.length >= i,
        );
        // csv += `${person?.onDuty[i - 1]?.name ?? ""},`;
        shift.push(person?.onDuty[i - 1]?.name ?? "");
      }
    });
    csv += shift.join(",") + "\n";
  });
  return csv;
};

type GenerateProps = {
  stations: InputStation[];
  people: Person[];
  days: number;
};

export const getShifts = ({ stations, ...rest }: GenerateProps) => {
  // const THOARTS = 17;
  // const queue =
  //   // _.shuffle(
  //   Array.from({ length: THOARTS }, (_, i) => ({
  //     id: i + 1,
  //     name: (i + 1).toString(),
  //   }));
  // );

  // TODO: input
  const shifts = generate({ stations, ...rest });
  // printShifts(shifts);
  // printMetrics(shifts);
  return generateCsv(shifts, stations);
};
