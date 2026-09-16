interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

const Button = ({ text, onClick, className = "" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2 
        sm:px-7 sm:py-5 
        bg-green-600 
        hover:bg-green-700 
        active:bg-green-800
        text-white 
        font-semibold 
        text-base sm:text-lg
        rounded-xl 
        transition-all 
        duration-300 
        transform 
        hover:scale-105 
        active:scale-95
        shadow-lg 
        hover:shadow-2xl
        focus:outline-none 
        focus:ring-4 
        focus:ring-green-500/50
     mb-[1rem]
        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default Button;
