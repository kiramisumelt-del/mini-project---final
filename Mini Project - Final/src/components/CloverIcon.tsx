interface StarIconProps {
  className?: string;
}

export function StarIcon({ className = "w-4 h-4" }: StarIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.5l2.85 5.78a1 1 0 00.75.55l6.38.93a1 1 0 01.55 1.7l-4.62 4.5a1 1 0 00-.29.88l1.09 6.36a1 1 0 01-1.45 1.05L12 21.24a1 1 0 00-.93 0l-5.71 3a1 1 0 01-1.45-1.05l1.09-6.36a1 1 0 00-.29-.88l-4.62-4.5a1 1 0 01.55-1.7l6.38-.93a1 1 0 00.75-.55L12 2.5z" />
    </svg>
  );
}

// Alias CloverIcon to StarIcon so existing references automatically display the star icon
export const CloverIcon = StarIcon;
