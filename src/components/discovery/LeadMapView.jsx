import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ScorePill } from '../common/ScorePill';
import { PriorityBadge } from '../common/Badge';
import { Phone, Globe, Plus, Check } from 'lucide-react';

// Fix default Leaflet icon paths in React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically fit map bounds to markers
function MapBoundsUpdater({ results }) {
  const map = useMap();
  useEffect(() => {
    if (results && results.length > 0) {
      const validPoints = results.filter(r => r.lat && r.lng).map(r => [r.lat, r.lng]);
      if (validPoints.length > 0) {
        map.fitBounds(validPoints, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [results, map]);
  return null;
}

export function LeadMapView({ results, onSaveLead, onViewLead, savingMap }) {
  // Center of Chhatrapati Sambhajinagar (Aurangabad)
  const defaultCenter = [19.8762, 75.3433];

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater results={results} />

        {results.map((item, idx) => {
          if (!item.lat || !item.lng) return null;
          return (
            <Marker
              key={item.sourceRecordId || idx}
              position={[item.lat, item.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[220px] max-w-[280px]">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-xs leading-tight">
                      {item.businessName}
                    </h4>
                    <ScorePill score={item.score} size="sm" />
                  </div>

                  <p className="text-[11px] text-cyan-400 font-medium">
                    {item.category} • {item.locality}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    {item.businessPhone && (
                      <p className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {item.businessPhone}
                      </p>
                    )}
                    {item.businessWebsite && (
                      <p className="flex items-center gap-1 truncate text-blue-400">
                        <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{item.businessWebsite.replace('https://', '')}</span>
                      </p>
                    )}
                  </div>

                  {item.opportunityTypes && item.opportunityTypes.length > 0 && (
                    <div className="pt-1 border-t border-slate-750">
                      <p className="text-[10px] text-slate-400 font-medium">Observed Opportunity:</p>
                      <p className="text-[11px] text-amber-300 font-medium leading-tight">
                        {item.opportunityTypes[0]}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center">
                    <PriorityBadge priority={item.priority} />
                    {item.isSaved ? (
                      <button
                        onClick={() => onViewLead(item.savedLeadId)}
                        className="px-2 py-1 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold border border-slate-700"
                      >
                        Saved in CRM
                      </button>
                    ) : (
                      <button
                        onClick={() => onSaveLead(item)}
                        disabled={savingMap?.[item.sourceRecordId]}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Save Lead</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-20 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400">
        Interactive Lead Map View
      </div>
    </div>
  );
}
