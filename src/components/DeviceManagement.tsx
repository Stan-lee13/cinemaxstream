
import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, Clock, Globe, Shield, AlertCircle } from 'lucide-react';
import { getUserDevices, removeDevice, DeviceInfo, generateFingerprint } from '@/utils/providers/deviceTracker';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface DeviceManagementProps {
  userId: string;
}

const DeviceManagement = ({ userId }: DeviceManagementProps) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFingerprint, setCurrentFingerprint] = useState('');

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserDevices(userId);
      setDevices(data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setCurrentFingerprint(generateFingerprint());
    fetchDevices();
  }, [userId, fetchDevices]);

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const success = await removeDevice(deviceId);
      if (success) {
        toast.success('Device removed successfully');
        setDevices(devices.filter(d => d.id !== deviceId));
      } else {
        toast.error('Failed to remove device');
      }
    } catch (error) {
      toast.error('Error removing device');
    }
  };

  const getDeviceIcon = (os: string | null) => {
    const osLower = os?.toLowerCase() || '';
    if (osLower.includes('ios') || osLower.includes('android')) return <Smartphone size={24} />;
    if (osLower.includes('mac') || osLower.includes('windows') || osLower.includes('linux')) return <Monitor size={24} />;
    return <Tablet size={24} />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Shield size={20} className="text-cyan-500" />
            Active Device Sessions
          </h3>
          <p className="text-sm text-gray-400 mt-1">You can have up to 5 active devices at a time.</p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-bold text-cyan-500 uppercase tracking-widest">
          {devices.length} / 5
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {devices.map((device) => {
          const isCurrent = device.device_fingerprint === currentFingerprint;

          return (
            <div
              key={device.id}
              className={`p-6 rounded-[24px] border transition-all flex items-center gap-4 relative overflow-hidden backdrop-blur-xl ${
                isCurrent ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCurrent ? 'bg-cyan-500/20 text-cyan-500' : 'bg-white/10 text-gray-400'
              }`}>
                {getDeviceIcon(device.device_os)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white truncate">
                    {device.device_os || 'Unknown OS'} • {device.device_browser || 'Unknown Browser'}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-cyan-500 text-black rounded-full">
                      Current Device
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Last Active: {new Date(device.last_active_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    {device.device_resolution || 'Unknown Resolution'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveDevice(device.id)}
                disabled={isCurrent}
                className={`p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'opacity-20 cursor-not-allowed text-gray-500'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
                }`}
                title={isCurrent ? "You cannot remove your current device" : "Remove device"}
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}

        {devices.length === 0 && (
          <div className="text-center py-10 bg-white/5 border border-white/5 border-dashed rounded-[32px]">
            <AlertCircle size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">No active device sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
