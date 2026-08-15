import React from 'react';
import { TemplateStudio } from './templates/TemplateStudio';

export function DocumentStudioModule() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          📄 Document Studio
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
            A4 Vector Print Ready
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Official A4 print templates for client passport submissions and visa requirements.
        </p>
      </div>

      {/* Render Templates Studio */}
      <TemplateStudio />
    </div>
  );
}
