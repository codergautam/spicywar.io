interface Data {
  id: string;
  pos: {x: number, y: number};
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
}
interface FirstPlayerData extends PlayerData {
  name: string;
  team: string;
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
}
interface BridgeData {
  width: number,
  length: number,
  angle: number,
  pos: {x: number, y: number},
  corners: {x: number, y: number}[],
};

export { Data, BridgeData, IslandData, BulletData, PlayerData, FirstPlayerData };