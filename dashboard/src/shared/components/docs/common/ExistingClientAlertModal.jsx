import React from 'react';
import {
  UserCheck,
  Phone,
  CreditCard,
  FileCheck,
  CopyCheck,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

/**
 * Modal dialog that freezes the screen when an existing client matches by phone/passport/NID.
 * User MUST make a conscious choice before proceeding:
 * 1. Auto-fill from existing client
 * 2. Update existing client data with current form entries
 * 3. Ignore & create new document unlinked
 */
export function ExistingClientAlertModal({
  client,
  onAutoFill,
  onUpdateExisting,
  onProceedAsNew
}) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white text-black border border-black/10 shadow-2xl rounded-2xl max-w-xl w-full h-[70vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header with warning icon & Lock badge */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 p-6 pb-4 bg-black/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/15 text-amber-600 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Client Match Found!
              </h3>
              <p className="text-xs text-black/60 mt-0.5">
                An existing client record matching this phone number or passport was found in the database.
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/15 text-amber-600 px-2.5 py-1 rounded-full shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>Warning</span>
          </span>
        </div>

        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-5">
        {/* Existing Client Profile Card */}
        <div className="bg-black/[0.02] border border-black/10 p-4 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-primary font-bold text-[11px]">
              {client.clientCode || 'CUST-RECORD'}
            </span>
            <span className="font-semibold text-foreground">
              {client.applications?.length || 0}  Linked Service Records
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-foreground font-medium pt-1">
            <div>
              <span className="text-muted-foreground block text-[10.5px]">Full Name:</span>
              <span className="font-bold text-sm">{client.fullName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">Phone Number:</span>
              <span className="font-mono font-bold">{client.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">Passport Number:</span>
              <span className="font-mono font-bold">{client.passportNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">National ID (NID):</span>
              <span className="font-mono font-bold">{client.nidNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action Choices Required */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-bold text-foreground">
            How would you like to proceed? Select an option below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Auto Fill */}
            <button
              type="button"
              onClick={onAutoFill}
              className="flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-left">
                <CopyCheck className="w-4 h-4 shrink-0" />
                <div>
                  <p>Auto-Fill Form</p>
                  <p className="text-[10px] font-normal opacity-80">Populate form fields with saved client profile</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 2: Update Existing Profile */}
            <button
              type="button"
              onClick={onUpdateExisting}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-left">
                <RefreshCw className="w-4 h-4 shrink-0" />
                <div>
                  <p>Update Profile Record</p>
                  <p className="text-[10px] font-normal opacity-80">Update client database record with current form data</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Option 3: Create as New / Skip Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onProceedAsNew}
              className="text-[11.5px] text-black/60 hover:text-black underline transition-colors cursor-pointer"
            >
              Save as a standalone document without linking to database record
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
