
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  fixed?: boolean;
}

const BackButton = ({ className = "", fixed = false }: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className={`${fixed ? 'fixed top-20 left-4 z-30' : ''} bg-black/30 hover:bg-black/50 rounded-full ${className}`}
      onClick={handleGoBack}
    >
      <ArrowLeft size={20} />
    </Button>
  );
};

export default BackButton;
