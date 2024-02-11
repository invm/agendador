import dayjs from 'dayjs';
import _ from 'lodash';

const MIN_REST = 8 * 60;
const END_DAYS = 1;
const TIME_FORMAT = 'hh:mm';
const MAX_SHIFT_TIME = 7200;
const CONSIDERED_LAST_SHIFTS = 24;

const WEIGHT_REST = 1;
const WEIGHT_SAME_PERSON = -4;
const WEIGHT_SAME_HOUR = -4;

const setHour = (date, h) => date.set('h', h).set('m', 0).set('s', 0).set('ms', 0);

// add metrics
// count rest periods between shifts
// max, min global colored in the rest period matrix
// total per person
// average per person

const stations = [
  {
    name: 'gate',
    start: setHour(dayjs(), 8),
    input: [],
    minPeople: 2,
    shiftTime: {
      constant: 240, // in minutes
      // TODO v2: dynamic should be summed to 24
    },
  },
  {
    name: 'patrol',
    start: setHour(dayjs(), 6),
    input: [],
    minPeople: 1,
    shiftTime: {
      constant: 240,
      // TODO v2: dynamic should be summed to 24
    },
  },
];

const print = (shifts) => {
  shifts.forEach((shift) => {
    console.log('Shift:', shift);
  });
};

const validShift = (shifts, onDuty) => {
  const lastShifts = _.take(_.reverse(shifts), CONSIDERED_LAST_SHIFTS);
  if (!lastShifts.length) {
    return true;
  }
  return !!lastShifts.find((curr) => {
    return _.intersection(curr, onDuty).length === 2;
  });
};

const getCost = ({ person, shifts, startTime, minPeople, onDuty }) => {
  const lastShifts = _.filter(_.take(_.reverse(_.cloneDeep(shifts)), CONSIDERED_LAST_SHIFTS), (shift) => {
    return !!_.find(shift.onDuty, { id: person.id });
  });
  if (_.find(onDuty, { id: person.id })) return { cost: -Infinity, restPeriod: 0 };
  if (!lastShifts.length) return { cost: Infinity, restPeriod: Infinity };
  const shiftTime = 4;
  const restPeriod = startTime.diff(lastShifts[0].startTime, 'h') - shiftTime; // heighest weight
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

const populateOnDuty = ({ startTime, queue, shifts, minPeople, onDuty }) => {
  while (onDuty.length < minPeople) {
    const q = queue.map((person) => {
      const { cost, restPeriod } = getCost({ startTime, person, shifts, minPeople, onDuty });
      return { ...person, cost, restPeriod };
    });
    queue = _.orderBy(q, ['cost'], ['desc']);
    console.log(_.first(queue));
    onDuty.push(_.first(queue));
  }
  // const v = validShift(shifts, onDuty);
};

const generate = ({ stations, input, constraints, people }) => {
  const [scheduleStartTime, scheduleEndTime] = stations.reduce(
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
  let startTime = scheduleStartTime;
  const endTime = setHour(dayjs(), scheduleEndTime.get('h')).add(END_DAYS, 'd');
  let queue = people;
  let shifts = [];
  const step = stations.reduce((step, curr) => {
    return curr.shiftTime.constant < step ? curr.shiftTime.constant : step;
  }, MAX_SHIFT_TIME);

  while (startTime.isBefore(endTime)) {
    // TODO: add randomness element and keep track for next cycle to not fuck the same person again
    stations.forEach(({ minPeople, name }) => {
      // it is initial because it will change in case the same peopl
      // TODO v2: provide the whole station info to cost function
      const start = startTime.format(TIME_FORMAT);
      const shift = { onDuty: [], start, startTime, name, minPeople };
      shifts.push(shift);
    });

    startTime = startTime.add(step, 'm');
  }
  const allShifts = [];
  shifts.forEach(({ minPeople, ...shift }) => {
    const onDuty = [];
    populateOnDuty({ startTime, queue, shifts: allShifts, minPeople, onDuty });
    allShifts.push({ ...shift, onDuty });
  });

  console.log(allShifts[-1]);

  console.table(
    allShifts.map((s) => {
      s.onDuty = s.onDuty.map((p) => p.name);
      return s;
    }),
  );
  return [];
};

const printMetrics = (shifts) => {
  const rest = {};

  shifts.forEach((shift) => { });
};

const main = () => {
  const people = [
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
  const constraints = [];
  const shifts = generate({ stations, people, constraints });

  printMetrics(shifts);
};

main();
