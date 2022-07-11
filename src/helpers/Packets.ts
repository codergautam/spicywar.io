interface Data {
  id: string;
  pos: {x: number, y: number};
}
interface PepperData extends Data {
  color: string;
}

interface PlayerData extends Data {
  health: number;
  lookAngle: number;
  maxHealth: number;
  peppers: number;
  hit: boolean;
  level: number;
  untilNextLevel: number;
  bodySize: number;
  canFly: boolean;
}
interface FirstPlayerData extends PlayerData {
  name: string;
  team: string;
  joinTime: number;
}
interface BulletData extends Data {
  angle: number;
  speed: number;
  owner: string;
}
interface IslandData {
  pos: {x: number, y: number};
  id: number;
  shape: string;
  capturedBy: string;
  size: number;
  capturedPercentage: number;
  capturingBy: string;
  people: string[];
  currentwhat: {state: number, capturedBy: string, capturingBy: string, dir: number};
}
interface BridgeData {
  width: number,
  length: number,
  angle: number,
  pos: {x: number, y: number},
  corners: {x: number, y: number}[],
};

export { BridgeData, IslandData, BulletData, PlayerData, FirstPlayerData, PepperData };