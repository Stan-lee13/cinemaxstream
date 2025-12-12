import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';

const MobileSearchButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden text-foreground hover:text-primary"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="top-[10%] max-w-lg p-4">
          <SearchBar />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileSearchButton;
