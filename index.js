import dayjs from 'dayjs';
import _ from 'lodash';

const MIN_REST = 8 * 60;
const END_DAYS = 4;
const TIME_FORMAT = 'hh:mm';
const MAX_SHIFT_TIME = 7200;
const CONSIDERED_LAST_SHIFTS = 24;

const WEIGHT_REST = 1;
const WEIGHT_SAME_PERSON = -5;
const WEIGHT_SAME_HOUR = -4;

const setHour = (date, h) => date.set('h', h).set('m', 0).set('s', 0).set('ms', 0);

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
    return !!shift.onDuty.includes(person);
  });
  if (onDuty.includes(person)) return -100000;
  if (!lastShifts.length) return 100000;
  const shiftTime = 4;
  const restPeriod = startTime.diff(lastShifts[0].startTime, 'h') - shiftTime; // heighest weight
  const sameShiftHour = startTime.get('h') === lastShifts[0].startTime.get('h');
  const sameShiftPersons = onDuty.length < minPeople ? lastShifts.find((s) => s.onDuty.includes(onDuty[0])) : false;
  // const totalRestTime = 0 // TODO v2: sum time between shifts

  const restCost = restPeriod * WEIGHT_REST;
  const sameHourCost = sameShiftHour ? WEIGHT_SAME_HOUR : 0;
  const samePersonCost = sameShiftPersons ? WEIGHT_SAME_PERSON : 0;

  return restCost + sameHourCost + samePersonCost;
};

const populateOnDuty = ({ startTime, queue, shifts, minPeople, onDuty }) => {
  while (onDuty.length < minPeople) {
    const q = queue.map((person) => {
      const cost = getCost({ startTime, person, shifts, minPeople, onDuty });
      return { person, cost };
    });
    queue = _.orderBy(q, ['cost'], ['desc']).map((p) => p.person);
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

  console.table(allShifts);
  return [];
};

const main = () => {
  const people = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  // const people = _.shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
  const constraints = [];
  const shifts = generate({ stations, people, constraints });
  print(shifts);
};

main();
