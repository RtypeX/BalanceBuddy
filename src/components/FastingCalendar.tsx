'use client';

import React, {useState} from 'react';
import {Calendar} from "@/components/ui/calendar";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";

const FastingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date ? format(date, "PPP") : (
              <span>Pick a date</span>
            )}
            {/*<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>*/}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) =>
              date > new Date() || date < new Date('2024-01-01')
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FastingCalendar;
