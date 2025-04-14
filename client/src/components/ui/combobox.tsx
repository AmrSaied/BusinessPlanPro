import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language-context";

type ComboboxItem = {
  value: string;
  label: string;
};

interface ComboboxProps {
  items: ComboboxItem[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function Combobox({ 
  items, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  id 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

  // Find the selected item to display its label
  const selectedItem = items.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={id}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", isRTL ? "mr-2" : "ml-2")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={cn(isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
          <CommandInput placeholder={t('search_placeholder', 'Search...')} className={cn(isRTL && "text-right")} />
          <CommandEmpty>{t('no_results', 'No results found.')}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={cn(isRTL && "flex-row-reverse")}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0",
                    isRTL && "mr-0 ml-2"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}