// export const DEVICE_COMMANDS = {
//   UNLOCK: 'sclockctrl0',
//   LOCK: 'sclockctrl1',
//   SET_SPEED_LIMIT_NORMAL_MODE_5: 'scsetspdlim-normal-5',
//   SET_SPEED_LIMIT_NORMAL_MODE_10: 'scsetspdlim-normal-10',
//   SET_SPEED_LIMIT_NORMAL_MODE_15: 'scsetspdlim-normal-15',
//   SET_SPEED_LIMIT_NORMAL_MODE_20: 'scsetspdlim-normal-20',
//   SET_SPEED_LIMIT_NORMAL_MODE_25: 'scsetspdlim-normal-25',
//   START_ENGINE: 'scenginectrl-on',
//   SHUT_DOWN_ENGINE: 'scenginectrl-off',
// };

export const DEVICE_COMMANDS = {
  UNLOCK: 'unlock-dev',
  LOCK: 'lock-dev',
  SET_SPEED_LIMIT_NORMAL_MODE_5: 'speed-limit-norm-5',
  SET_SPEED_LIMIT_NORMAL_MODE_10: 'speed-limit-norm-10',
  SET_SPEED_LIMIT_NORMAL_MODE_15: 'speed-limit-norm-15',
  SET_SPEED_LIMIT_NORMAL_MODE_20: 'speed-limit-norm-20',
  SET_SPEED_LIMIT_NORMAL_MODE_25: 'speed-limit-norm-25',
  START_ENGINE: 'engine-on',
  SHUT_DOWN_ENGINE: 'engine-off',
};

export const DEVICE_COMMANDS_DYNAMIC = {
  5: DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_5,
  10: DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_10,
  15: DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_15,
  20: DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_20,
  25: DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_25,
};
