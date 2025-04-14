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
  // Original English name for nationality items (optional)
  englishName?: string;
};

interface ComboboxProps {
  items: ComboboxItem[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  // Custom filter function for multi-language search
  customFilter?: (item: ComboboxItem, search: string) => boolean;
}

export function Combobox({ 
  items, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  id,
  customFilter 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

  // Find the selected item to display its label
  const selectedItem = items.find((item) => item.value === value);
  
  // Filter items based on input value, using custom filter if provided
  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items;
    
    return items.filter(item => {
      if (customFilter) {
        return customFilter(item, inputValue);
      }
      
      // Default filter behavior - case insensitive search on label
      return item.label.toLowerCase().includes(inputValue.toLowerCase());
    });
  }, [items, inputValue, customFilter]);

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
      <PopoverContent className={cn("w-full p-0", isRTL && "ml-0 mr-0")} align={isRTL ? "end" : "start"}>
        <Command className={cn(isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
          <CommandInput 
            placeholder={t('search_placeholder', 'Search...')} 
            dir={isRTL ? "rtl" : "ltr"} 
            className={cn(isRTL && "text-right")} 
            onValueChange={setInputValue}
            value={inputValue}
          />
          <CommandEmpty>{t('no_results', 'No results found.')}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {filteredItems.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={cn("flex items-center", isRTL && "flex-row-reverse justify-between")}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0",
                    isRTL ? "ml-2" : "mr-2"
                  )}
                />
                <span className={cn(isRTL && "text-right w-full")}>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}