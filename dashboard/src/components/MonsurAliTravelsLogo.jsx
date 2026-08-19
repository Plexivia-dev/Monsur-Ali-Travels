import logoImg from '../assets/logo.png';

export const MonsurAliTravelsLogo = ({ className = 'h-8 w-auto', iconOnly = false, alt = 'Monsur Ali Travels Logo' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoImg}
        alt={alt}
        className="h-full w-auto max-h-full object-contain shrink-0 rounded-md"
      />
      {!iconOnly && (
        <span className="font-bold tracking-tight text-foreground text-sm">
          Monsur Ali Travels
        </span>
      )}
    </div>
  );
};

export default MonsurAliTravelsLogo;
