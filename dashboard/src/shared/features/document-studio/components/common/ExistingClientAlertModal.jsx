import React, { useEffect } from 'react';
import {
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  X,
  CheckCircle2,
  Folder,
  Lock,
} from 'lucide-react';

/**
 * ExistingClientAlertModal
 *
 * Strict Yes/No un-dismissible blocking modal shown when a phone
 * matches an existing client record in the database.
 *
 * Behavior:
 * - Backdrop clicks / clicks outside do NOTHING (modal will not close)
 * - Esc key is intercepted and disabled
 * - Only Yes and No buttons can close/resolve the modal
 * - "Yes" -> auto-fill form with client data
 * - "No"  -> reset the phone field so user can enter a new number
 */
export function ExistingClientAlertModal({ client, caseFile = null, onYes, onNo }) {
  // Prevent Escape key from closing the modal
  useEffect(() => {
    if (!client) return;
    const blockEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockEscape, true);
    return () => window.removeEventListener('keydown', blockEscape, true);
  }, [client]);

  if (!client) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-card border-2 border-amber-500/80 shadow-2xl rounded-2xl max-w-lg w-full p-6 text-foreground space-y-5 relative animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">
                There is an existing client with this number!
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Lock className="w-3 h-3" />
                Action Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              We found an existing client registered with this mobile number. Do you want to use this client's info to create the document, or provide a different number?
            </p>
          </div>
        </div>

        {/* Existing Client Profile Card */}
        <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{client.fullName || client.name || '—'}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                ID: {client.clientCode || client.did || client._id || ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 bg-background/80 p-2 rounded-lg border border-border">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Phone Number</p>
                <p className="font-mono font-bold text-foreground truncate">{client.phone || client.mobileNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 p-2 rounded-lg border border-border">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="font-mono font-bold text-foreground truncate">{client.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 p-2 rounded-lg border border-border">
              <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">NID Number</p>
                <p className="font-mono font-bold text-foreground truncate">{client.nidNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 p-2 rounded-lg border border-border">
              <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Passport Number</p>
                <p className="font-mono font-bold text-foreground truncate">{client.passportNumber || '—'}</p>
              </div>
            </div>
          </div>

          {/* Open Case File (if exists) */}
          {caseFile && (
            <div className="mt-2 pt-2 border-t border-border flex items-center gap-2 bg-sky-500/5 border border-sky-500/20 p-2.5 rounded-lg">
              <Folder className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold">Active Case File</p>
                <p className="font-bold text-sky-600 dark:text-sky-400 text-xs">
                  #{caseFile.caseNumber || caseFile._id} — {caseFile.destinationCountry || caseFile.caseType || 'Active Case'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* NO */}
          <button
            type="button"
            onClick={onNo}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>No, Enter Different Number</span>
          </button>

          {/* YES */}
          <button
            type="button"
            onClick={onYes}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes, Use This Client</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExistingClientAlertModal;

