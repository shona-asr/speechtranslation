import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const Header = ({ title, description, actions }: HeaderProps) => {
  const { signOutUser } = useAuth();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        
      </div>
    </header>
  );
};

export default Header;
