import { Bell, Search, RefreshCw, Calendar, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language.startsWith('en') ? 'EN' : 'BR';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-end h-16 px-6 gap-4">
        
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-3 h-9 hover:bg-muted/50 transition-all border border-border/20">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-tight">{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px] p-1 shadow-xl border-border/50 animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuItem 
              onClick={() => changeLanguage('pt')}
              className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md transition-colors"
            >
              <span className="text-lg">🇧🇷</span>
              <span className="text-xs font-medium">Português</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => changeLanguage('en')}
              className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md transition-colors"
            >
              <span className="text-lg">🇺🇸</span>
              <span className="text-xs font-medium">English</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/50" />

        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
