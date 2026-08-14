import logoImage from '@/assets/logo.webp';

export const MonsurAliTravelsLogo = ({
  className = 'h-16 w-16',
  alt = 'Monsur Ali Travels logo',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={logoImage}
        alt={alt}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
