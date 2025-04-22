import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { useTranslation } from "react-i18next"

// Import date-fns locales
import { enUS } from "date-fns/locale"
import { ar } from "date-fns/locale"
import { es } from "date-fns/locale"
import { fr } from "date-fns/locale"
import { de } from "date-fns/locale"
import { zhCN } from "date-fns/locale"
import { ru } from "date-fns/locale"
import { pt } from "date-fns/locale"
import { hi } from "date-fns/locale"
import { ja } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Map language codes to date-fns locales
const localeMap: Record<string, any> = {
  en: enUS,
  ar,
  es,
  fr,
  de,
  zh: zhCN,
  ru,
  pt,
  hi,
  ja
};

// Localized month labels for languages that might need special handling
const monthLabels = {
  ar: {
    months: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ]
  }
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Get current language from i18next
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const currentLocale = localeMap[currentLanguage] || enUS;
  
  // Use custom formatting for languages that need it
  const formatters = React.useMemo(() => {
    if (currentLanguage === 'ar') {
      return {
        formatMonthCaption: (date: Date) => {
          const monthIndex = date.getMonth();
          return monthLabels.ar.months[monthIndex];
        },
        formatWeekdayName: (date: Date) => {
          // Get localized day name in Arabic
          return date.toLocaleDateString('ar', { weekday: 'short' });
        },
        formatCaption: (date: Date, options: any) => {
          // Custom caption formatting for Arabic
          const monthName = monthLabels.ar.months[date.getMonth()];
          return (
            <div className="rdp-caption_dropdowns" style={{display: 'flex', gap: '0.5rem'}}>
              <div className="rdp-dropdown_month">
                <select
                  aria-label="شهر"
                  className="rdp-dropdown_month-select"
                  value={date.getMonth()}
                  onChange={(e) => options.onMonthChange?.(Number(e.target.value))}
                >
                  {monthLabels.ar.months.map((month, i) => (
                    <option key={i} value={i}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rdp-dropdown_year">
                <select
                  aria-label="سنة"
                  className="rdp-dropdown_year-select"
                  value={date.getFullYear()}
                  onChange={(e) => options.onYearChange?.(Number(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 5 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        }
      };
    }
    return {};
  }, [currentLanguage]);
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={currentLocale}
      className={cn("p-3 calendar-component", className)}
      formatters={formatters}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
