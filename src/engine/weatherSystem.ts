import { Weather, WeatherType, CandyType, Position, BOARD_SIZE, BASIC_CANDY_TYPES, Candy } from '@/types';
import { WEATHER_CONFIG } from '@/data/config';

export function createInitialWeather(): Weather {
  return {
    type: 'sunny',
    duration: 5,
  };
}

export function createInitialForecast(): Weather[] {
  const forecast: Weather[] = [];
  for (let i = 0; i < 3; i++) {
    forecast.push(generateRandomWeather(i + 1));
  }
  return forecast;
}

function generateRandomWeather(dayOffset: number): Weather {
  const types: WeatherType[] = ['sunny', 'candyRain', 'caramelStorm', 'frost'];
  const weights = [40, 25, 20, 15];
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let selectedType: WeatherType = 'sunny';
  
  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedType = types[i];
      break;
    }
  }

  const duration = 3 + Math.floor(Math.random() * 4);
  
  const weather: Weather = {
    type: selectedType,
    duration,
  };

  if (selectedType === 'candyRain') {
    weather.targetCandyType = BASIC_CANDY_TYPES[Math.floor(Math.random() * BASIC_CANDY_TYPES.length)];
  }

  if (selectedType === 'caramelStorm') {
    weather.stickyPositions = generateStickyPositions();
  }

  return weather;
}

function generateStickyPositions(): Position[] {
  const positions: Position[] = [];
  const count = 4 + Math.floor(Math.random() * 5);
  const usedPositions = new Set<string>();
  
  while (positions.length < count) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    const key = `${row},${col}`;
    
    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      positions.push({ row, col });
    }
  }
  
  return positions;
}

export function advanceWeather(currentWeather: Weather, forecast: Weather[]): {
  current: Weather;
  newForecast: Weather[];
  weatherChanged: boolean;
} {
  let newCurrent = { ...currentWeather, duration: currentWeather.duration - 1 };
  let newForecast = [...forecast];
  let weatherChanged = false;

  if (newCurrent.duration <= 0) {
    newCurrent = { ...forecast[0] };
    newForecast = [...forecast.slice(1), generateRandomWeather(forecast.length)];
    weatherChanged = true;
  }

  return { current: newCurrent, newForecast, weatherChanged };
}

export function getCandyRainBonus(type: CandyType, weather: Weather): number {
  if (weather.type === 'candyRain' && weather.targetCandyType === type) {
    return WEATHER_CONFIG.CANDY_RAIN_BONUS;
  }
  return 1;
}

export function isPositionSticky(pos: Position, weather: Weather): boolean {
  if (weather.type !== 'caramelStorm' || !weather.stickyPositions) {
    return false;
  }
  return weather.stickyPositions.some(p => p.row === pos.row && p.col === pos.col);
}

export function getFrostLoadMultiplier(weather: Weather): number {
  if (weather.type === 'frost') {
    return WEATHER_CONFIG.FROST_LOAD_MULTIPLIER;
  }
  return 1;
}

export function getWeatherDescription(weather: Weather): string {
  const config: Record<WeatherType, string> = {
    sunny: '晴朗',
    candyRain: '糖雨',
    caramelStorm: '焦糖风暴',
    frost: '霜冻',
  };
  return config[weather.type];
}

export function getWeatherIcon(weather: Weather): string {
  const icons: Record<WeatherType, string> = {
    sunny: '☀️',
    candyRain: '🍬',
    caramelStorm: '🌪️',
    frost: '❄️',
  };
  return icons[weather.type];
}

export function getWeatherEffectDescription(weather: Weather): string {
  switch (weather.type) {
    case 'sunny':
      return '天气晴朗，一切正常';
    case 'candyRain':
      return `${weather.targetCandyType ? getCandyName(weather.targetCandyType) : ''}掉落率提升！`;
    case 'caramelStorm':
      return `部分格子被焦糖黏住，无法消除`;
    case 'frost':
      return `装载效率降低50%`;
    default:
      return '';
  }
}

function getCandyName(type: CandyType): string {
  const names: Record<CandyType, string> = {
    strawberry: '草莓糖',
    lemon: '柠檬糖',
    mint: '薄荷糖',
    blueberry: '蓝莓糖',
    grape: '葡萄糖',
    rainbow: '彩虹糖',
    bomb: '炸弹糖',
  };
  return names[type];
}

export function applyStickyToBoard(board: (Candy | null)[][], weather: Weather): (Candy | null)[][] {
  if (weather.type !== 'caramelStorm' || !weather.stickyPositions) {
    return board;
  }

  const newBoard = board.map(row => row.map(c => c ? { ...c } : null));
  
  for (const pos of weather.stickyPositions) {
    if (newBoard[pos.row][pos.col]) {
      newBoard[pos.row][pos.col]!.isSticky = true;
    }
  }
  
  return newBoard;
}

export function clearStickyFromBoard(board: (Candy | null)[][]): (Candy | null)[][] {
  const newBoard = board.map(row => row.map(c => c ? { ...c, isSticky: false } : null));
  return newBoard;
}
