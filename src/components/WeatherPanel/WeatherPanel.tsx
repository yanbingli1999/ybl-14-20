import useGameStore from '@/store/useGameStore';
import { getWeatherIcon, getWeatherDescription, getWeatherEffectDescription } from '@/engine/weatherSystem';
import { WEATHER_CONFIG } from '@/data/config';
import { CloudRain, Umbrella, Clock, AlertTriangle } from 'lucide-react';

export default function WeatherPanel() {
  const { weather, weatherForecast, profile, dispatchDelayed, buyShelter, delayDispatch } = useGameStore();

  const canBuyShelter = !profile.hasShelter && profile.coins >= WEATHER_CONFIG.SHELTER_COST;
  const canDelayDispatch = !dispatchDelayed && profile.coins >= WEATHER_CONFIG.DELAY_DISPATCH_COST;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 shadow-lg border border-blue-100">
      <div className="mb-3 flex items-center gap-2 text-gray-600">
        <CloudRain className="w-5 h-5" />
        <span className="font-medium">天气预报</span>
      </div>

      <div className="bg-white/80 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getWeatherIcon(weather)}</span>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {getWeatherDescription(weather)}
              </div>
              <div className="text-sm text-gray-500">
                剩余 {weather.duration} 回合
              </div>
            </div>
          </div>
          {weather.type !== 'sunny' && (
            <div className="flex items-center gap-1 text-orange-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">天气影响</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-lg">
          {getWeatherEffectDescription(weather)}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">未来天气</div>
        <div className="flex gap-2">
          {weatherForecast.map((w, i) => (
            <div
              key={i}
              className="flex-1 bg-white/60 rounded-lg p-2 text-center"
            >
              <div className="text-xl mb-1">{getWeatherIcon(w)}</div>
              <div className="text-xs font-medium text-gray-700">
                {getWeatherDescription(w)}
              </div>
              <div className="text-xs text-gray-400">{w.duration}回合</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={buyShelter}
          disabled={!canBuyShelter}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            profile.hasShelter
              ? 'bg-green-100 text-green-700 cursor-default'
              : canBuyShelter
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Umbrella className="w-4 h-4" />
          {profile.hasShelter
            ? '✓ 已拥有遮棚'
            : `购买遮棚 (${WEATHER_CONFIG.SHELTER_COST} 金币)`}
        </button>

        <button
          onClick={delayDispatch}
          disabled={!canDelayDispatch}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            dispatchDelayed
              ? 'bg-green-100 text-green-700 cursor-default'
              : canDelayDispatch
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Clock className="w-4 h-4" />
          {dispatchDelayed
            ? '✓ 已暂缓发车'
            : `暂缓发车 (+${WEATHER_CONFIG.DELAY_DISPATCH_MOVES_BONUS} 步数, ${WEATHER_CONFIG.DELAY_DISPATCH_COST} 金币)`}
        </button>
      </div>

      {profile.hasShelter && (
        <div className="mt-3 text-xs text-center text-green-600 bg-green-50 py-2 rounded-lg">
          ☂️ 遮棚已生效：免疫焦糖风暴和霜冻效果
        </div>
      )}

      {dispatchDelayed && (
        <div className="mt-3 text-xs text-center text-amber-600 bg-amber-50 py-2 rounded-lg">
          ⏰ 已暂缓发车：获得额外步数，等待好天气
        </div>
      )}
    </div>
  );
}
