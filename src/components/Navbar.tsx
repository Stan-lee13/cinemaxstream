
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Menu, 
  Film, 
  Tv, 
  Play, 
  Heart, 
  Download,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    to={href} 
    className="text-gray-300 hover:text-white transition-colors relative group"
  >
    <span>{children}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cinemax-500 transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
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
              <NavItem href="/">Home</NavItem>
              <NavItem href="/movies">Movies</NavItem>
              <NavItem href="/series">TV Series</NavItem>
              <NavItem href="/anime">Anime</NavItem>
              <NavItem href="/sports">Sports</NavItem>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <div className="relative animate-fade-in">
                <Input 
                  placeholder="Search for movies, series..." 
                  className="w-60 bg-secondary/70 border-gray-700 focus:border-cinemax-500 text-white"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <X size={18} />
                </Button>
              </div>
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center gap-1 text-gray-300 hover:text-white"
            >
              <Heart size={16} />
              <span>Favorites</span>
            </Button>
            
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
                  <Link to="/favorites" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Heart size={18} />
                    <span>Favorites</span>
                  </Link>
                  <Link to="/downloads" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                    <Download size={18} />
                    <span>Downloads</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Button className="hidden md:flex bg-cinemax-500 hover:bg-cinemax-600">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
