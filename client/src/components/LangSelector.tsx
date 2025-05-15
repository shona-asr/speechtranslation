import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupportedLanguages } from "@shared/languages";

interface LangSelectorProps {
  value: string;
  onChange: (value: string) => void;
  includeAuto?: boolean;
  label?: string;
  disabled?: boolean;
  useLanguageCodes?: boolean;
}

const LangSelector = ({
  value,
  onChange,
  includeAuto = false,
  label = "Language",
  disabled = false,
  useLanguageCodes = false, // When true, the component will use and return language codes instead of names
}: LangSelectorProps) => {
  // Get all supported languages
  const languages = getSupportedLanguages(includeAuto);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang: {name: string, code: string}) => (
            <SelectItem 
              key={useLanguageCodes ? lang.code : lang.name.toLowerCase()} 
              value={useLanguageCodes ? lang.code : lang.name.toLowerCase()}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LangSelector;
