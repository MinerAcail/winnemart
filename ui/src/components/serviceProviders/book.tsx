import React, { useState, useEffect } from "react";
import { format, addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define types
interface TimeSlot {
  day: Date;
  time: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface Booking {
  id: number;
  slot: TimeSlot;
  user: UserData;
  tableSize: number;
}

const defaultTimeSlots: string[] = [
  "8 am",
  "9 am",
  "10 am",
  "11 am",
  "12 pm",
  "1 pm",
  "2 pm",
  "3 pm",
  "4 pm",
  "5 pm",
  "6 pm",
  "7 pm",
  "8 pm",
  "9 pm",
  "10 pm",
  "11 pm",
];
const TableBookingSystem = ({
  isDialogOpenMain,
  setDialogOpenMain,
}: {
  isDialogOpenMain: boolean;
  setDialogOpenMain: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const today = startOfDay(new Date()); // Use startOfDay to remove time component
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [tableSize, setTableSize] = useState<number>(2);
  const [timeSlots] = useState<string[]>(defaultTimeSlots);
  // Removed unused bookingStep state
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  // Removed unused bookings state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // Removed unused weekDates state
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const [datesPerPage] = useState(7);

  // Generate dates for the current view, starting from today
  useEffect(() => {
    const newDates = [];
    for (let i = 0; i < 14; i++) {
      newDates.push(addDays(currentDate, i));
    }
    // Removed unused weekDates state update

    // Set visible dates (first page)
    setVisibleDates(newDates.slice(0, datesPerPage));
  }, [currentDate, datesPerPage]);

  const handlePreviousWeek = (): void => {
    const newDate = addDays(currentDate, -7);
    // Don't allow navigating to dates before today
    if (!isBefore(newDate, today)) {
      setCurrentDate(newDate);
    }
  };

  const handleNextWeek = (): void => {
    setCurrentDate((prevDate) => addDays(prevDate, 7));
  };

  // Generate available slots based on date - only for future dates
  const generateAvailability = (): TimeSlot[] => {
    // Mock some slots as already booked
    const bookedSlots: TimeSlot[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate random future day, 0-6 days ahead
      const randomDay = Math.floor(Math.random() * 7);
      const futureDate = addDays(today, randomDay);
      const randomSlot = Math.floor(Math.random() * timeSlots.length);
      bookedSlots.push({
        day: futureDate,
        time: timeSlots[randomSlot],
      });
    }
    return bookedSlots;
  };

  const bookedSlots = generateAvailability();

  const isSlotBooked = (day: Date, time: string): boolean => {
    return bookedSlots.some(
      (slot) => isSameDay(slot.day, day) && slot.time === time
    );
  };

  // Check if a date is in the past
  const isDateInPast = (date: Date): boolean => {
    return isBefore(date, today);
  };

  // Check if the slot time is in the past for today's date
  const isSlotInPast = (day: Date, time: string): boolean => {
    if (!isSameDay(day, today)) return false;

    // For today, check if the time has already passed
    const currentHour = new Date().getHours();
    const slotHour = parseInt(time.replace(/[^0-9]/g, ""));
    const isPM = time.toLowerCase().includes("pm");
    const slot24Hour =
      slotHour === 12 ? (isPM ? 12 : 0) : isPM ? slotHour + 12 : slotHour;

    return slot24Hour <= currentHour;
  };

  const handleSlotClick = (time: string): void => {
    if (
      selectedDate &&
      !isSlotBooked(selectedDate, time) &&
      !isSlotInPast(selectedDate, time)
    ) {
      setSelectedSlot({ day: selectedDate, time });
      setIsDialogOpen(true);
    }
  };

  const handleDateSelect = (date: Date): void => {
    if (!isDateInPast(date)) {
      setSelectedDate(date);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const confirmBooking = (): void => {
    if (!selectedSlot) {
      return;
    }

    const newBooking: Booking = {
      id: Date.now(),
      slot: selectedSlot,
      user: userData,
      tableSize: tableSize,
    };

    setIsDialogOpen(false);
    setSelectedSlot(null);
    setUserData({ name: "", email: "", phone: "", notes: "" });

    // In a real app, you would send this data to your backend
    console.log("Booking confirmed:", newBooking);
  };

  // Compact date selector component
  const CompactDateSelector = () => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Button
            onClick={handlePreviousWeek}
            variant="outline"
            size="icon"
            disabled={isSameDay(currentDate, today)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">
            {format(currentDate, "MMMM d, yyyy")}
          </h3>
          <Button onClick={handleNextWeek} variant="outline" size="icon">
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {visibleDates.map((date) => {
            const isPastDate = isDateInPast(date);
            return (
              <div
                key={date.toString()}
                onClick={() => !isPastDate && handleDateSelect(date)}
                className={`p-2 text-center rounded-md ${
                  isPastDate
                    ? "text-gray-300 cursor-not-allowed"
                    : selectedDate && isSameDay(selectedDate, date)
                    ? "bg-blue-500 text-white cursor-pointer"
                    : "hover:bg-blue-50 cursor-pointer"
                }`}
              >
                <div className="text-xs">{format(date, "EEE")}</div>
                <div className="font-medium">{format(date, "d")}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Responsive Layout Toggle */}

      <Dialog open={isDialogOpenMain} onOpenChange={setDialogOpenMain}>
        <DialogContent className=" rounded-lg">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Select a Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Compact Date Selector */}
                <CompactDateSelector />

                {/* Time Grid */}
                {selectedDate && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Available times for {format(selectedDate, "MMMM d")}
                    </h3>

                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const booked = isSlotBooked(selectedDate, time);
                        const isPast = isSlotInPast(selectedDate, time);
                        return (
                          <div
                            key={time}
                            onClick={() =>
                              !booked && !isPast && handleSlotClick(time)
                            }
                            className={`p-2 text-center rounded-lg border text-sm ${
                              booked || isPast
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : selectedSlot?.time === time &&
                                  isSameDay(selectedSlot.day, selectedDate)
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer border-blue-100"
                            }`}
                          >
                            {time}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button onClick={confirmBooking}>Confirm Booking</Button>
            <Button variant="outline" onClick={() => setDialogOpenMain(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Booking Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-lg">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              {selectedSlot && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {format(selectedSlot.day, "EEE, MMM d")} at{" "}
                    {selectedSlot.time}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="tableSize" className="text-sm">
                  Table Size (People)
                </Label>
                <select
                  id="tableSize"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={tableSize}
                  onChange={(e) => setTableSize(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleUserChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleUserChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm">
                  Special Requests (optional)
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={userData.notes}
                  onChange={handleUserChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              className="w-full sm:w-auto"
              onClick={confirmBooking}
              disabled={!userData.name || !userData.email || !userData.phone}
            >
              Confirm Booking
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableBookingSystem;
