import logoImg from '../assets/logo.png';

export const MonsurAliTravelsLogo = ({ className = 'h-10 w-auto', iconOnly = false, alt = 'Monsur Ali Travels Logo' }) => {
  return (
    <div className={`inline-flex items-center justify-start text-left gap-3 ${className}`}>
      <div className="size-10 rounded-full bg-white p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-border/20">
        <img
          src={logoImg}
          alt={alt}
          className="w-full h-full object-contain shrink-0"
        />
      </div>
      {!iconOnly && (
        <div className="flex flex-col min-w-0 text-left items-start">
          <span className="font-semibold text-sm text-foreground tracking-tight truncate leading-tight">
            Monsur Ali Travels
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
            Smart ERP v2.0
          </span>
        </div>
      )}
    </div>
  );
};

export default MonsurAliTravelsLogo;
