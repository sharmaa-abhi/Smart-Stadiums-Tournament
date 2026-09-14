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
    }, 1200);
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`cyber-card ${cardStyle} p-4 sm:p-5 rounded-2xl transition-all duration-300 relative group`}
    >
      {/* Top Meta Line: Status Badge, Incident ID, and SLA / Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-mono uppercase tracking-wider ${badgeClass}`}>
            {badgeText}
          </span>
          <span className="text-xs font-mono font-semibold text-white/50 tracking-wider">
            ID: {incident.incident_id || incident.id || 'INC-8821'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {incident.slaRemaining && (
            <span className="text-[11px] font-mono font-bold text-amber-400/90 tracking-tight">
              SLA: {incident.slaRemaining}
            </span>
          )}
          <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/30" />
            {incident.time || '12s ago'}
          </span>
        </div>
      </div>

      {/* Incident Title & Subtitle / Location */}
      <div className="mb-4">
        <h4 className="text-base sm:text-lg font-bold font-display text-white tracking-tight leading-snug">
          {incident.title || incident.type || 'Turnstile Sensor #12 Flapping'}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-cyan-400 font-medium">
            {incident.zone || 'Gate B Entry Array'}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/40 font-mono text-[11px]">
            {incident.subLocation || 'Sub-Array Optical Gateway'}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics Container */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] mb-4 space-y-2.5 font-mono text-xs">
        {/* Metric Row 1: Primary Telemetry */}
        {incident.packetLoss !== undefined ? (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Packet Loss:</span>
            <span className="font-bold text-rose-400">
              {incident.packetLoss}% <span className="text-white/30 font-normal">(Fail threshold &gt;5%)</span>
            </span>
          </div>
        ) : incident.latencySpike ? (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Latency Spike:</span>
            <span className="font-bold text-amber-400">
              {incident.latencySpike} <span className="text-white/30 font-normal">(Normal &lt;45ms)</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Anomaly Rate:</span>
            <span className="font-bold text-rose-400">
              High Disruption (38 req/s)
            </span>
          </div>
        )}

        {/* Metric Row 2: Throughput / Capacity / Backpressure */}
        {incident.ingressThroughput !== undefined ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/50">Ingress Throughput:</span>
              <span className="font-bold text-rose-400">
                {incident.ingressThroughput} <span className="text-white/30 font-normal">(-54% degraded)</span>
              </span>
            </div>
            {/* Visual Degradation Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                style={{ width: '46%' }}
              />
            </div>
          </div>
        ) : incident.backpressure ? (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Backpressure:</span>
            <span className="font-bold text-amber-400">
              {incident.backpressure}
            </span>
          </div>
        ) : incident.mmWaveDrop ? (
          <div className="flex items-center justify-between">
            <span className="text-white/50">mmWave Carrier Aggregation:</span>
            <span className="font-bold text-cyan-400">
              Drop rate: {incident.mmWaveDrop}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Current Status:</span>
            <span className="font-bold text-amber-400 capitalize">
              {incident.status || 'Active Triage'}
            </span>
          </div>
        )}
      </div>

      {/* Dispatch status banner (if dispatched or team assigned) */}
      {(incident.assignedTeam || incident.assignee || isP1) && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {incident.assignedTeam || 'Tech Team 4 Dispatched'}
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-0.5 truncate font-mono">
              Team Lead: <span className="text-white/70 font-semibold">{incident.teamLead || 'J. Martinez'}</span> • En route via {incident.route || 'Tunnel B4'}
            </p>
          </div>

          <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold whitespace-nowrap ml-2">
            ETA: {incident.eta || '2m 40s'}
          </div>
        </div>
      )}

      {/* Action Button Row */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {isP1 ? (
          <>
            <button
              onClick={handleReroute}
              disabled={rerouted}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                rerouted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500 text-surface-950 font-extrabold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95'
              }`}
            >
              {rerouted ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              {rerouted ? 'Rerouted to A/C' : '⇄ Reroute B → A/C'}
            </button>

            <button
              onClick={handleFailOpen}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                overrideActive
                  ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 active:scale-95'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              {overrideActive ? 'Override Active' : 'Fail-Open Override'}
            </button>
          </>
        ) : isP2 ? (
          <>
            <button
              onClick={handleReroute}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-semibold transition-all"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Assign Team 2
            </button>

            <button
              onClick={handleDiagnostics}
              disabled={diagnosticsRunning}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-semibold transition-all"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
              {diagnosticsRunning ? 'Running...' : 'Run Diagnostics'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRebalance}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {rebalanced ? 'Sector Balanced' : 'Rebalance Sector'}
            </button>

            <button
              onClick={() => onAction && onAction(incident.id || incident.incident_id, 'view_spectrum', true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-semibold transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              View Spectrum
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
