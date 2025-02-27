// utils/dateUtils.ts

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export function getRelativeTime(date: string | Date): string {
  const inputDate = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  // Handle invalid dates
  if (!inputDate.getTime() || isNaN(seconds)) {
    return 'Invalid date';
  }

  // Handle future dates
  if (seconds < 0) {
    return inputDate.toLocaleString();
  }

  // Define time intervals
  const intervals = [
    { seconds: YEAR, label: 'year' },
    { seconds: MONTH, label: 'month' },
    { seconds: WEEK, label: 'week' },
    { seconds: DAY, label: 'day' },
    { seconds: HOUR, label: 'hour' },
    { seconds: MINUTE, label: 'minute' },
    { seconds: 1, label: 'second' }
  ];

  // Find the appropriate interval
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    
    if (count >= 1) {
      // Handle singular vs plural
      const plural = count === 1 ? '' : 's';
      return `${count} ${interval.label}${plural} ago`;
    }
  }

  return 'just now';
}

// // Example usage in your component:
// const FormattedDate = ({ date }: { date: string | Date }) => {
//   const relativeTime = getRelativeTime(date);
//   const fullDate = new Date(date).toLocaleString();
  
//   return (
//     <Badge className="ml-3" title={fullDate}>
//       {relativeTime}
//     </Badge>
//   );
// };

// export default FormattedDate;