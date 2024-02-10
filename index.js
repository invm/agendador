import dayjs from 'dayjs';
import _ from 'lodash';

const MIN_REST = 8 * 60;
const END_DAYS = 2;
const TIME_FORMAT = 'hh:mm';
const MAX_SHIFT_TIME = 7200;
const CONSIDERED_LAST_SHIFTS = 8;

const WEIGHT_REST = 100;
const WEIGHT_SAME_PERSON = -200;
const WEIGHT_SAME_HOUR = -200;

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
  const lastShifts = _.take(_.reverse(_.cloneDeep(shifts)), CONSIDERED_LAST_SHIFTS);
  if (!lastShifts.length) {
    return true;
  }
  return !!lastShifts.find((curr) => {
    return _.intersection(curr, onDuty).length === 2;
  });
};

const cost = ({ person, shifts, startTime }) => {
  const lastShift = _.find(_.reverse(_.cloneDeep(shifts)), (shift) => {
    return !!shift.onDuty.includes(person);
  });
  if (!lastShift) return 100000;
  const shiftTime = 4;
  const restPeriod = startTime.diff(lastShift.startTime, 'h') - shiftTime; // heighest weight
  const sameShiftHour = startTime.get('h') === lastShift.startTime.get('h');
  const sameShiftPersons = false; // TODO
  // const totalRestTime = 0 // TODO v2: sum time between shifts

  const restCost = restPeriod * WEIGHT_REST;
  const sameHourCost = sameShiftHour ? WEIGHT_SAME_HOUR : 0;
  const samePersonCost = sameShiftPersons ? Math.ceil(WEIGHT_SAME_PERSON * Math.random()) : 0;
  console.log({ samePersonCost });

  return restCost + sameHourCost + samePersonCost;
};

const getNextShift = ({ startTime, queue, shifts, minPeople }) => {
  // console.log(shifts);
  queue = _.reverse(_.sortBy(queue, (person) => cost({ startTime, person, shifts })));
  // console.log(queue);
  let onDuty = _.take(queue, minPeople);
  // const v = validShift(shifts, onDuty);
  // if (v) {
  //   onDuty.forEach((p) => {
  //     _.pull(queue, p);
  //   });
  //   queue.push(...onDuty);
  // } else {
  //   // while (!validShift(shifts, onDuty)) {
  //   onDuty = _.shuffle(_.take(queue, minPeople * 2));
  //   onDuty = _.sampleSize(onDuty, minPeople);
  //   // console.log({ onDuty });
  //   onDuty.forEach((p) => {
  //     _.pull(queue, p);
  //   });
  //   queue.push(...onDuty);
  // }
  return onDuty;
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
  const shifts = [];
  const step = stations.reduce((step, curr) => {
    return curr.shiftTime.constant < step ? curr.shiftTime.constant : step;
  }, MAX_SHIFT_TIME);

  while (startTime.isBefore(endTime)) {
    // TODO: add randomness element and keep track for next cycle to not fuck the same person again
    stations.forEach(({ minPeople, name }) => {
      // it is initial because it will change in case the same peopl
      // TODO v2: provide the whole station info to cost function
      const start = startTime.format(TIME_FORMAT);
      const onDuty = getNextShift({ startTime, queue, shifts, minPeople });
      const shift = { onDuty, start, startTime, name };
      shifts.push(shift);
    });

    startTime = startTime.add(step, 'm');
  }
  console.table(shifts);
  return [];
};

const main = () => {
  const people = _.shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
  const constraints = [];
  const shifts = generate({ stations, people, constraints });
  print(shifts);
};

main();
