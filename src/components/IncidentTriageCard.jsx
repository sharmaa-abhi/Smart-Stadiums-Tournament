import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Radio, AlertOctagon, CheckCircle2,
  Users, Zap, RefreshCw
} from 'lucide-react';

export default function IncidentTriageCard({ incident, onAction }) {
  const [overrideActive, setOverrideActive] = useState(false);
  const [rerouted, setRerouted] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [rebalanced, setRebalanced] = useState(false);

  const priority = (incident.priority || 'p2').toLowerCase();
  const isP1 = priority === 'p1' || priority === 'critical';
  const isP2 = priority === 'p2' || priority === 'warning';

  const cardStyle = isP1
    ? 'cyber-card-p1'
    : isP2
    ? 'cyber-card-p2'
    : 'cyber-card-p3';

  const badgeText = isP1
    ? 'CRITICAL P1'
    : isP2
    ? 'WARNING P2'
    : 'INVESTIGATING P3';

  const badgeClass = isP1
    ? 'badge-p1'
    : isP2
    ? 'badge-p2'
    : 'badge-p3';

  const handleFailOpen = (e) => {
    e.stopPropagation();
    setOverrideActive(!overrideActive);
    if (onAction) {
      onAction(incident.id || incident.incident_id, 'fail_open_override', !overrideActive);
    }
  };

  const handleReroute = (e) => {
    e.stopPropagation();
    setRerouted(true);
    if (onAction) {
      onAction(incident.id || incident.incident_id, 'reroute', true);
    }
  };

  const handleDiagnostics = (e) => {
    e.stopPropagation();
    setDiagnosticsRunning(true);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      if (onAction) {
        onAction(incident.id || incident.incident_id, 'diagnostics', true);
      }
    }, 1000);
  };

  const handleRebalance = (e) => {
    e.stopPropagation();
    setRebalanced(true);
    if (onAction) {
      onAction(incident.id || incident.incident_id, 'rebalance', true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={`cyber-card ${cardStyle} p-4 rounded-xl transition-all duration-200 relative group flex flex-col justify-between`}
    >
      {/* Top Meta Line */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${badgeClass}`}>
              {badgeText}
            </span>
            <span className="text-[11px] font-mono text-white/50 tracking-wider">
              {incident.incident_id || incident.id || 'INC-8821'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {incident.slaRemaining && (
              <span className="text-[10px] font-mono font-bold text-amber-400/90 tracking-tight">
                SLA: {incident.slaRemaining}
              </span>
            )}
            <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-white/30" />
              {incident.time || '12s ago'}
            </span>
          </div>
        </div>

        {/* Incident Title & Subtitle */}
        <div className="mb-3">
          <h4 className="text-sm font-bold font-display text-white tracking-tight leading-snug">
            {incident.title || incident.type || 'Turnstile Sensor #12 Flapping'}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-emerald-400 font-semibold font-mono">
              {incident.zone || 'Gate B Entry Array'}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-white/40 font-mono text-[10px] truncate">
              {incident.subLocation || 'Sub-Array Optical Gateway'}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Container */}
        <div className="p-2.5 rounded-lg bg-[#07090d]/80 border border-white/[0.05] mb-3 space-y-2 font-mono text-[11px]">
          {incident.packetLoss !== undefined ? (
            <div className="flex items-center justify-between">
              <span className="text-white/45">Packet Loss:</span>
              <span className="font-bold text-rose-400">
                {incident.packetLoss}% <span className="text-white/30 font-normal">(&gt;5% limit)</span>
              </span>
            </div>
          ) : incident.latencySpike ? (
            <div className="flex items-center justify-between">
              <span className="text-white/45">Latency Spike:</span>
              <span className="font-bold text-amber-400">
                {incident.latencySpike} <span className="text-white/30 font-normal">(&lt;45ms baseline)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white/45">Anomaly Rate:</span>
              <span className="font-bold text-rose-400">
                Disruption (38 req/s)
              </span>
            </div>
          )}

          {incident.ingressThroughput !== undefined ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/45">Ingress Flow:</span>
                <span className="font-bold text-rose-400">
                  {incident.ingressThroughput} <span className="text-white/30 font-normal">(-54%)</span>
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: '46%' }}
                />
              </div>
            </div>
          ) : incident.backpressure ? (
            <div className="flex items-center justify-between">
              <span className="text-white/45">Backpressure:</span>
              <span className="font-bold text-amber-400">
                {incident.backpressure}
              </span>
            </div>
          ) : incident.mmWaveDrop ? (
            <div className="flex items-center justify-between">
              <span className="text-white/45">Carrier Drop:</span>
              <span className="font-bold text-cyan-400">
                {incident.mmWaveDrop}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white/45">State:</span>
              <span className="font-bold text-amber-400 uppercase">
                {incident.status || 'Triage'}
              </span>
            </div>
          )}
        </div>

        {/* Assigned Team Unit */}
        {(incident.assignedTeam || incident.assignee || isP1) && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-3 text-[11px]">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white tracking-tight">
                {incident.assignedTeam || 'Tech Team 4 Dispatched'}
              </span>
              <p className="text-[10px] text-white/40 mt-0.5 truncate font-mono">
                Lead: <span className="text-white/70">{incident.teamLead || 'J. Martinez'}</span> • {incident.route || 'Tunnel B4'}
              </p>
            </div>
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold whitespace-nowrap ml-2">
              ETA: {incident.eta || '2m 40s'}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.05]">
        {isP1 ? (
          <>
            <button
              onClick={handleReroute}
              disabled={rerouted}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rerouted
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-500 text-[#07090d] hover:bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.3)] active:scale-98'
              }`}
            >
              {rerouted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {rerouted ? 'Rerouted' : '⇄ Reroute B'}
            </button>

            <button
              onClick={handleFailOpen}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                overrideActive
                  ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:bg-rose-500/25 active:scale-98'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              {overrideActive ? 'Override ON' : 'Fail-Open'}
            </button>
          </>
        ) : isP2 ? (
          <>
            <button
              onClick={handleReroute}
              className="btn-secondary py-1.5 px-2 text-xs font-mono"
            >
              <Users className="w-3 h-3 text-cyan-400" />
              Assign Team
            </button>

            <button
              onClick={handleDiagnostics}
              disabled={diagnosticsRunning}
              className="btn-secondary py-1.5 px-2 text-xs font-mono"
            >
              <Zap className={`w-3 h-3 text-amber-400 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
              {diagnosticsRunning ? 'Testing...' : 'Diagnostics'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRebalance}
              className="btn-secondary py-1.5 px-2 text-xs font-mono"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              {rebalanced ? 'Balanced' : 'Rebalance'}
            </button>

            <button
              onClick={() => onAction && onAction(incident.id || incident.incident_id, 'view_spectrum', true)}
              className="btn-secondary py-1.5 px-2 text-xs font-mono"
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              Spectrum
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
