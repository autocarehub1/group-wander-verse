import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, MapPin, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import wanderTogetherLogo from "@/assets/wandertogether-logo.png";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-b-2 border-primary/30 shadow-xl transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={wanderTogetherLogo} 
              alt="WanderTogether Logo" 
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-base font-bold gradient-text hidden sm:block">WanderTogether</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
              Dashboard
            </Link>
            {user && (
              <>
                <Link to="/trips" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
                  My Trips
                </Link>
                <Link to="/expense-tracking" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
                  Expenses
                </Link>
                <Link to="/expense-payments" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
                  Payments
                </Link>
                <Link to="/payment-verification" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
                  Verify
                </Link>
                <Link to="/chat" className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:scale-105">
                  Chat
                </Link>
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          {user ? (
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} key={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button variant="default">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-lg shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user && (
                <>
                  <Link
                    to="/trips"
                    className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Trips
                  </Link>
                  <Link
                    to="/expense-tracking"
                    className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Expenses
                  </Link>
                  <Link
                    to="/chat"
                    className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chat
                  </Link>
                  <Link
                    to="/expense-payments"
                    className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Payments
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-all font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
              
              {user ? (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-base font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base font-medium">
                      <User className="mr-3 h-5 w-5" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start h-12 text-base font-medium" onClick={handleSignOut}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-base font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="default" className="w-full h-12 text-base font-medium">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;