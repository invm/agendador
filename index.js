import dayjs from 'dayjs';
import _ from 'lodash';

const MIN_REST = 480; // in minutes
const END_DAYS = 4;
const TIME_FORMAT = 'hh:mm';
const MAX_SHIFT_TIME = 7200;
const CONSIDERED_LAST_SHIFTS = 24;

const WEIGHT_REST = 1;
const WEIGHT_SAME_PERSON = -4;
const WEIGHT_SAME_HOUR = -4;

const setHour = (date, h) => date.set('h', h).set('m', 0).set('s', 0).set('ms', 0);

const stations = [
  {
    name: 'gate',
    start: setHour(dayjs(), 8),
    input: [],
    minPeople: 2,
    shiftTime: 4,
    shiftInterval: 'h',
  },
  {
    name: 'patrol',
    start: setHour(dayjs(), 6),
    input: [],
    minPeople: 1,
    shiftTime: 4,
    shiftInterval: 'h',
  },
];

const validShift = (shifts, onDuty) => {
  const lastShifts = _.take(_.reverse(shifts), CONSIDERED_LAST_SHIFTS);
  if (!lastShifts.length) {
    return true;
  }
  return !!lastShifts.find((curr) => {
    return _.intersection(curr, onDuty).length === 2;
  });
};

const getCost = (args) => {
  const { person, shifts, startTime, minPeople, onDuty, shiftTime, shiftInterval } = args;
  const lastShifts = _.filter(_.take(_.reverse(_.cloneDeep(shifts)), CONSIDERED_LAST_SHIFTS), (shift) => {
    return !!_.find(shift.onDuty, { id: person.id });
  });
  if (_.find(onDuty, { id: person.id })) return { cost: -Infinity, restPeriod: 0 };
  if (!lastShifts.length) return { cost: Infinity, restPeriod: Infinity };
  const restPeriod = startTime.diff(lastShifts[0].startTime, shiftInterval) - shiftTime;
  const sameShiftHour = startTime.get('h') === lastShifts[0].startTime.get('h');
  const sameShiftPersons =
    onDuty.length < minPeople && onDuty.length > 0
      ? _.find(lastShifts, (s) => _.find(s.onDuty, { id: onDuty[0].id }))
      : false;
  // const totalRestTime = 0 // TODO v2: sum time between shifts

  const restCost = restPeriod * WEIGHT_REST;
  const sameHourCost = sameShiftHour ? WEIGHT_SAME_HOUR : 0;
  const samePersonCost = sameShiftPersons ? WEIGHT_SAME_PERSON : 0;

  return { cost: restCost + sameHourCost + samePersonCost, restPeriod };
};

const populateOnDuty = ({ startTime, queue, shifts, minPeople, onDuty, shiftTime, shiftInterval }) => {
  while (onDuty.length < minPeople) {
    const q = queue.map((person) => {
      const { cost, restPeriod } = getCost({ startTime, person, shifts, minPeople, onDuty, shiftTime, shiftInterval });
      return { ...person, cost, restPeriod };
    });
    queue = _.orderBy(q, ['cost'], ['desc']);
    onDuty.push(_.first(queue));
  }
  // const v = validShift(shifts, onDuty);
};

const generate = ({ stations, queue }) => {
  let [startTime, scheduleEndTime] = stations.reduce(
    (acc, curr) => {
      let [min, max] = acc;
      if (curr.start.isBefore(min)) {
        min = curr.start;
      }
      if (curr.start.isAfter(max)) {
        max = curr.start;
      }
      return [min, max];
    },
    [stations[0].start, stations[0].start],
  );
  // TODO: concat to already provided input and change start to be the start of input
  const endTime = setHour(dayjs(), scheduleEndTime.get('h')).add(END_DAYS, 'd');
  let shifts = [];
  const [step, interval] = stations.reduce(
    (step, curr) => {
      return curr.shiftTime < step[0] ? [curr.shiftTime, curr.shiftInterval] : step;
    },
    [MAX_SHIFT_TIME, 0],
  );

  while (startTime.isBefore(endTime)) {
    // TODO: add randomness element and keep track for next cycle to not fuck the same person again
    stations.forEach(({ minPeople, name, shiftTime, shiftInterval }) => {
      // it is initial because it will change in case the same peopl
      // TODO v2: provide the whole station info to cost function
      const start = startTime.format(TIME_FORMAT);
      const shift = { onDuty: [], start, startTime, name, minPeople, shiftTime, shiftInterval };
      shifts.push(shift);
    });

    startTime = startTime.add(step, interval);
  }
  const allShifts = [];
  shifts.forEach(({ minPeople, shiftTime, shiftInterval, ...shift }) => {
    const onDuty = [];
    populateOnDuty({ startTime, queue, shifts: allShifts, minPeople, onDuty, shiftTime, shiftInterval });
    allShifts.push({ ...shift, onDuty, shiftTime, shiftInterval });
  });

  return allShifts;
};

const printMetrics = (shifts) => {
  let metrics = {},
    minRest = Infinity,
    maxRest = 0;

  shifts.forEach((shift) => {
    shift.onDuty.forEach((p) => {
      if (!metrics[p.id]) {
        metrics[p.id] = {
          shifts: [],
        };
      }
      metrics[p.id]['shifts'].push({
        startTime: shift.startTime,
      });
    });
  });
  Object.keys(metrics).forEach((id) => {
    metrics[id]['rest'] = metrics[id]['shifts'].reduce((acc, curr, i, arr) => {
      if (i === 0) {
        return acc;
      }
      const prev = arr[i - 1];
      const restPeriod = curr.startTime.diff(prev.startTime, 'h');
      if (restPeriod < minRest) {
        minRest = restPeriod;
      }
      if (restPeriod > maxRest) {
        maxRest = restPeriod;
      }
      acc.push(restPeriod);
      if (i === arr.length - 1) {
        const total = arr.reduce((acc, curr, i, arr) => {
          if (i === 0) {
            return acc;
          }
          const prev = arr[i - 1];
          return acc + curr.startTime.diff(prev.startTime, 'h');
        }, 0);
        const average = total / (arr.length - 1);
        acc['total'] = total;
        acc['average'] = +average.toFixed(1);
      }
      return acc;
    }, []);
    delete metrics[id]['shifts'];
  });
  console.log(metrics);
  console.log('minRest', minRest);
  console.log('maxRest', maxRest);
};

const printShifts = (shifts) => {
  console.table(
    _.cloneDeep(shifts).map((s) => {
      s.onDuty = s.onDuty.map((p) => p.name);
      delete s.shiftTime;
      delete s.shiftInterval;
      delete s.startTime;
      return s;
    }),
  );
};

const main = () => {
  const queue = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' },
    { id: 5, name: '5' },
    { id: 6, name: '6' },
    { id: 7, name: '7' },
    { id: 8, name: '8' },
    { id: 9, name: '9' },
    { id: 10, name: '10' },
    { id: 11, name: '11' },
    { id: 12, name: '12' },
  ];
  // const people = _.shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
  // TODO: input
  const shifts = generate({ stations, queue });
  printShifts(shifts);

  printMetrics(shifts);
};

main();
