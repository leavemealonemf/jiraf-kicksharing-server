export interface IRightechScooter {
  id: string;
  state: {
    lon?: number;
    lat?: number;
    charge?: number;
    online: boolean;
  };
}
