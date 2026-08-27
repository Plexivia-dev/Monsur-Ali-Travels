import React from 'react';
import {
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  X,
  CheckCircle2,
  Folder,
  MapPin,
  Lock,
} from 'lucide-react';

/**
 * ClientUniqueCheckModal
 *
 * Strict Yes/No blocking modal shown when a phone or email
 * already exists in the client database.
 *
 * Behavior:
 * - Backdrop clicks are DISABLED (pointer-events-none on overlay click)
 * - Only Yes and No buttons interact
 * - "Yes" → auto-fill form with existing client data + link clientId
 * - "No"  → clear the triggering field value, user must enter a new one
 *
 * Props:
 *   client      {object}  — matched client record from DB
 *   caseFile    {object|null} — most recent open case file of this client (optional)
 *   onYes       {fn}      — called when user confirms using existing client
 *   onNo        {fn}      — called when user rejects (field will be cleared by parent)
 */
export function ExistingClientAlertModal({ client, caseFile = null, onYes, onNo }) {
  if (!client) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      // Prevent any outside clicks from dismissing
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-card border-2 border-amber-500/60 shadow-2xl rounded-2xl max-w-lg w-full p-6 text-foreground space-y-5 relative"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <div className="p-3 bg-amber-500/15 text-amber-600 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">
                Existing Client Found!
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Lock className="w-3 h-3" />
                Uniqueness Guard
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              A client with this phone/email already exists in the database.
              Each phone number and email must be unique.
              Do you want to use this client's information?
            </p>
          </div>
        </div>

        {/* Existing Client Profile Card */}
        <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{client.fullName || '—'}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {client.clientCode || client.did || ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="font-mono font-bold text-foreground">{client.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="font-mono font-bold text-foreground truncate max-w-[120px]">{client.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Passport</p>
                <p className="font-mono font-bold text-foreground">{client.passportNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">NID</p>
                <p className="font-mono font-bold text-foreground">{client.nidNumber || '—'}</p>
              </div>
            </div>
          </div>

          {/* Open Case File (if exists) */}
          {caseFile && (
            <div className="mt-2 pt-2.5 border-t border-border flex items-center gap-2 bg-sky-500/5 border border-sky-500/20 p-2.5 rounded-lg">
              <Folder className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Open Case File</p>
                <p className="font-bold text-sky-600 dark:text-sky-400 text-xs">
                  #{caseFile.caseNumber || caseFile._id} —{' '}
                  {caseFile.destinationCountry || caseFile.caseType || 'Active Case'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Status:{' '}
                  <span className="font-semibold text-foreground capitalize">
                    {caseFile.status || 'Active'}
                  </span>
                  {caseFile.tradeSkill ? ` • ${caseFile.tradeSkill}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instruction */}
        <p className="text-xs text-muted-foreground text-center bg-muted/30 px-4 py-2.5 rounded-xl border border-border">
          If you select <strong className="text-foreground">Yes</strong>, the document will be generated under this client's record
          {caseFile ? ' and linked to the open case file' : ''}.
          If you select <strong className="text-foreground">No</strong>, the phone/email field will be cleared so you can enter a different number.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* NO */}
          <button
            type="button"
            onClick={onNo}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-sm transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>No, Enter Different Number</span>
          </button>

          {/* YES */}
          <button
            type="button"
            onClick={onYes}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all cursor-pointer shadow-xs"
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
