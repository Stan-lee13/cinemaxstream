
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Menu, 
  Film, 
  Tv, 
  Play, 
  Heart, 
  Download,
  X,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuthState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const NavItem = ({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
  <Link 
    to={href} 
    className={`text-gray-300 hover:text-white transition-colors relative group ${isActive ? 'text-white' : ''}`}
  >
    <span>{children}</span>
    <span className={`absolute -bottom-1 left-0 h-0.5 bg-cinemax-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
  </Link>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-gradient">CinemaxStream</h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <NavItem href="/" isActive={isActive('/')}>Home</NavItem>
              <NavItem href="/movies" isActive={isActive('/movies')}>Movies</NavItem>
              <NavItem href="/series" isActive={isActive('/series')}>TV Series</NavItem>
              <NavItem href="/anime" isActive={isActive('/anime')}>Anime</NavItem>
              <NavItem href="/sports" isActive={isActive('/sports')}>Sports</NavItem>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative animate-fade-in">
                <Input 
                  placeholder="Search for movies, series..." 
                  className="w-60 bg-secondary/70 border-gray-700 focus:border-cinemax-500 text-white"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSearch}
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <X size={18} />
                </Button>
              </form>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSearch}
                className="text-gray-300 hover:text-white"
                aria-label="Search"
              >
                <Search size={20} />
              </Button>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex items-center gap-1 text-gray-300 hover:text-white"
                onClick={() => navigate('/favorites')}
              >
                <Heart size={16} />
                <span>Favorites</span>
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background border-gray-800 w-[300px]">
                <nav className="flex flex-col gap-6 mt-8">
                  <Link to="/" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Film size={18} />
                    <span>Home</span>
                  </Link>
                  <Link to="/movies" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Film size={18} />
                    <span>Movies</span>
                  </Link>
                  <Link to="/series" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Tv size={18} />
                    <span>TV Series</span>
                  </Link>
                  <Link to="/anime" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Play size={18} />
                    <span>Anime</span>
                  </Link>
                  <Link to="/sports" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Play size={18} />
                    <span>Sports</span>
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link to="/favorites" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                        <Heart size={18} />
                        <span>Favorites</span>
                      </Link>
                      <Link to="/downloads" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                        <Download size={18} />
                        <span>Downloads</span>
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                        <Settings size={18} />
                        <span>Profile Settings</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-white hover:text-cinemax-400"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleSignIn}
                      className="flex items-center gap-2 text-white hover:text-cinemax-400"
                    >
                      <User size={18} />
                      <span>Sign In</span>
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            
            {isAuthenticated ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="bg-cinemax-500 text-sm">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-gray-700">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/downloads')}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Downloads</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      <Play className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 hover:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                className="hidden md:flex bg-cinemax-500 hover:bg-cinemax-600"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
