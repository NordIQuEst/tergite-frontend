export { default as deviceList } from "./device-list.json";
export { default as deviceCalibrationList } from "./calibrations.json";
export { default as projectList } from "./projects.json";
export { default as jobList } from "./jobs.json";
export { default as tokenList } from "./tokens.json";
export { default as userList } from "./users.json";

// export const deviceList: Device[] = [
//   {
//     name: "Loke",
//     version: "2024.04.1",
//     numberOfQubits: 8,
//     isOnline: false,
//     lastOnline: "2024-05-23T09:12:00.733Z",
//     basisGates: ["u", "h", "x"],
//     isSimulator: false,
//     couplingMap: [
//       [0, 1],
//       [1, 2],
//       [0, 3],
//       [1, 4],
//       [3, 4],
//       [2, 5],
//       [4, 5],
//       [3, 6],
//       [5, 7],
//       [6, 7],
//     ],
//     coordinates: [
//       [1, 1],
//       [2, 1],
//       [3, 2],
//       [1, 2],
//       [2, 2],
//       [3, 2],
//       [1, 3],
//       [3, 3],
//     ],
//   },
//   {
//     name: "Thor",
//     version: "2023.06.0",
//     numberOfQubits: 5,
//     isOnline: true,
//     lastOnline: null,
//     basisGates: ["u", "h", "x"],
//     isSimulator: true,
//     couplingMap: [
//       [0, 1],
//       [0, 2],
//       [2, 3],
//       [1, 4],
//       [3, 4],
//     ],
//     coordinates: [
//       [1, 1],
//       [3, 1],
//       [1, 2],
//       [2, 2],
//       [3, 2],
//     ],
//   },
//   {
//     name: "Pingu",
//     version: "2024.05.1",
//     numberOfQubits: 20,
//     isOnline: false,
//     lastOnline: "2024-05-24T09:12:00.733Z",
//     basisGates: ["u", "h", "x"],
//     isSimulator: false,
//     couplingMap: [
//       [0, 1],
//       [1, 2],
//       [2, 3],
//       [3, 4],
//       [0, 5],
//       [1, 6],
//       [5, 6],
//       [2, 7],
//       [6, 7],
//       [3, 8],
//       [7, 8],
//       [4, 9],
//       [8, 9],
//       [5, 10],
//       [10, 11],
//       [6, 11],
//       [11, 12],
//       [7, 12],
//       [12, 13],
//       [8, 13],
//       [13, 14],
//       [10, 15],
//       [15, 16],
//       [11, 16],
//       [16, 17],
//       [12, 17],
//       [17, 18],
//       [13, 18],
//       [18, 19],
//     ],
//     coordinates: [
//       [1, 1],
//       [2, 1],
//       [3, 1],
//       [4, 1],
//       [5, 1],
//       [1, 2],
//       [2, 2],
//       [3, 2],
//       [4, 2],
//       [5, 2],
//       [1, 3],
//       [2, 3],
//       [3, 3],
//       [4, 3],
//       [5, 3],
//       [1, 4],
//       [2, 4],
//       [3, 4],
//       [4, 4],
//       [5, 4],
//     ],
//   },
// ];

// export const deviceCalibrationData: DeviceCalibration[] = [
//   {
//     name: "Loke",
//     version: "2024.04.1",
//     lastCalibrated: "2024-05-23T09:12:00.733Z",
//     qubits: [
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 237.65862668313903,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 271.0497818645289,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.635664671787873,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3132760394092362,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.006299999999999972,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 332.84203243889,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 267.2825897210209,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.736284620626751,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3129180725120383,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.007099999999999995,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 299.04980556264877,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 184.24377667714367,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.819179392319009,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3112951524093254,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.022699999999999942,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 335.61765966870536,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 332.37022032523817,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.747177681407281,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3111534699659636,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.019299999999999984,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 380.4658047488371,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 317.2605442012689,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.7878694215104725,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31094540176555985,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.013399999999999967,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 188.825420616915,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 252.4523534198216,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.850828407561037,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31056606217183785,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.04960000000000009,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 316.15829966585943,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 277.57899277728444,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.8995534847853435,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3090557835234433,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.0373,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 57.40764602515758,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 76.1829800121589,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.755437174326001,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31100390518358323,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.016699999999999937,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 307.1464369155579,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 232.4592230445251,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.81259479377026,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31334511346081884,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.03520000000000001,
//         },
//       },
//     ],
//   },
//   {
//     name: "Thor",
//     version: "2023.06.0",
//     lastCalibrated: "2023-05-24T09:12:00.733Z",
//     qubits: [
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 420.05541643339404,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 83.18816437202933,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.637963897242323,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.29264088813258476,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.028900000000000037,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 247.7993516943705,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 187.26864764151065,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.804417611336644,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31122742580861,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.011199999999999988,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 260.54956749612603,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 81.99099168984513,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.74331607417109,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31179417408967897,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.009700000000000042,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 345.26623339601684,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 336.5462418628414,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.625938044796286,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31372359565205904,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.017800000000000038,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 133.43700196576077,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 163.4358380960457,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.556956356759932,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31377871528415735,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.042100000000000026,
//         },
//       },
//     ],
//   },
//   {
//     name: "Pingu",
//     version: "2024.05.1",
//     lastCalibrated: "2024-05-24T09:12:00.733Z",
//     qubits: [
//       {
//         t1_decoherence: {
//           date: "2024-07-06T05:23:30Z",
//           unit: "us",
//           value: 376.1954795789753,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 117.44415357751961,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.510091993429715,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3157712274724498,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.015100000000000002,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 379.4268309467702,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 451.3332143749617,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.599055241095608,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.32044986829453664,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.09149999999999991,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 250.2171989235223,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 169.34437085601053,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.93742960761812,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3088315131283205,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.0696,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 178.1734147408844,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 71.82919409906941,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.752768040364525,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31153154230934604,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.012599999999999945,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 345.4262192512364,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 54.68148267683786,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.659418331005301,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.2892599847835004,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.025700000000000056,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-05T10:34:57Z",
//           unit: "us",
//           value: 505.6568433380561,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 101.42385819005008,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.820713556618659,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31198328628677313,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.06340000000000001,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 279.55070127909687,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 53.57601064026625,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.7382860724666065,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3119696404967832,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.46730000000000005,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 261.33955214455665,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 23.63847457667814,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.773896970126417,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3114254225761893,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.2813,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-07T05:52:15Z",
//           unit: "us",
//           value: 435.8380369777706,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 228.16060855156175,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.668479079690902,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31331663183442576,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.020299999999999985,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 311.4139591283537,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 295.0381088312648,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.758097360564954,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31173856129806604,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.013299999999999979,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 434.9695999986262,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 126.40870872741573,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.611449904992542,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31354982608399573,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.01649999999999996,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 261.42552554483217,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 299.092640661312,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.731641435221681,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3122550841543125,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.02200000000000002,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 325.07438173563037,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 219.73958604202153,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.777295787098587,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31228117808626144,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.008399999999999963,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 441.90448040238476,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 144.58400814150525,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.680341907513583,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.31282791406798793,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.006900000000000017,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 184.9870542923758,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 74.64696399253995,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.7436205529205395,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.27186381179166696,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.040200000000000014,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 442.04488155496966,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 172.86807114966265,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.791731784998609,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.32426284330226407,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.010299999999999976,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 379.7693410154065,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 380.8733017380764,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.692904020384059,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3126801438234927,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.00869999999999993,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 233.57511451540825,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 38.00278498220496,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 5.057533041193664,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3070059221402992,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.009500000000000064,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-08T06:42:01Z",
//           unit: "us",
//           value: 250.9707150736723,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T06:56:44Z",
//           unit: "us",
//           value: 244.6208557648463,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.92998139285195,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.30828223495463736,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.025800000000000045,
//         },
//       },
//       {
//         t1_decoherence: {
//           date: "2024-07-07T05:52:15Z",
//           unit: "us",
//           value: 377.3469120833599,
//         },
//         t2_decoherence: {
//           date: "2024-07-08T07:18:48Z",
//           unit: "us",
//           value: 364.352421450391,
//         },
//         frequency: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: 4.677513017983542,
//         },
//         anharmonicity: {
//           date: "2024-07-08T22:03:09Z",
//           unit: "GHz",
//           value: -0.3137282279838826,
//         },
//         readout_assignment_error: {
//           date: "2024-07-08T06:16:05Z",
//           unit: "",
//           value: 0.009299999999999975,
//         },
//       },
//     ],
//   },
// ];

// export const projectList: Project[] = [
//   { name: "NordIQuEst", extId: "NordIQuEst-908" },
//   { name: "OpenSuperQPlus", extId: "OpenSuperQPlus-765" },
//   { name: "WACQT General", extId: "WACQT General-6452" },
// ];

// export const jobList: Job[] = [
//   {
//     jobId: "1",
//     deviceName: "Loke",
//     status: JobStatus.SUCCESSFUL,
//     durationInSecs: 400,
//     createdAt: "2024-06-20T09:12:00.733Z",
//   },
//   {
//     jobId: "2",
//     deviceName: "Loke",
//     status: JobStatus.SUCCESSFUL,
//     durationInSecs: 500,
//     createdAt: "2024-06-20T08:12:00.733Z",
//   },
//   {
//     jobId: "3",
//     deviceName: "Pingu",
//     status: JobStatus.PENDING,
//     durationInSecs: null,
//     createdAt: "2024-06-11T10:12:00.733Z",
//   },
//   {
//     jobId: "4",
//     deviceName: "Loke",
//     status: JobStatus.SUCCESSFUL,
//     durationInSecs: 400,
//     createdAt: "2024-06-20T11:12:00.733Z",
//   },
//   {
//     jobId: "5",
//     deviceName: "Pingu",
//     status: JobStatus.SUCCESSFUL,
//     durationInSecs: 800,
//     createdAt: "2024-06-19T12:12:00.733Z",
//   },
//   {
//     jobId: "6",
//     deviceName: "Thor",
//     status: JobStatus.FAILED,
//     failureReason: "device offline",
//     durationInSecs: 400,
//     createdAt: "2024-06-20T23:12:00.733Z",
//   },
// ];
