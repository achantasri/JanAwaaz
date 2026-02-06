// Simplified SVG path data for India's states and union territories
// viewBox: 0 0 600 700
// Names MUST exactly match the `state` field in constituencies.js

const indiaMapPaths = [
  // Jammu & Kashmir
  {
    name: "Jammu & Kashmir",
    path: "M 175 28 L 195 20 L 220 15 L 240 25 L 255 18 L 270 30 L 280 50 L 268 65 L 255 80 L 240 90 L 225 95 L 210 85 L 195 75 L 185 60 L 175 45 Z",
    labelX: 225, labelY: 55,
  },
  // Ladakh
  {
    name: "Ladakh",
    path: "M 270 30 L 290 20 L 320 15 L 345 25 L 355 40 L 345 55 L 330 65 L 310 70 L 290 65 L 280 50 Z",
    labelX: 312, labelY: 42,
  },
  // Himachal Pradesh
  {
    name: "Himachal Pradesh",
    path: "M 225 95 L 240 90 L 258 82 L 270 95 L 265 110 L 250 118 L 235 115 L 222 108 Z",
    labelX: 245, labelY: 103,
  },
  // Punjab
  {
    name: "Punjab",
    path: "M 195 100 L 222 108 L 235 115 L 240 130 L 230 142 L 215 145 L 200 138 L 190 125 L 188 112 Z",
    labelX: 215, labelY: 125,
  },
  // Uttarakhand
  {
    name: "Uttarakhand",
    path: "M 265 110 L 280 105 L 300 110 L 310 125 L 300 140 L 285 142 L 270 135 L 260 125 Z",
    labelX: 285, labelY: 125,
  },
  // Haryana
  {
    name: "Haryana",
    path: "M 215 145 L 230 142 L 240 148 L 248 160 L 242 175 L 228 180 L 215 175 L 208 162 L 210 150 Z",
    labelX: 228, labelY: 162,
  },
  // NCT of Delhi
  {
    name: "NCT of Delhi",
    path: "M 233 168 L 240 165 L 245 170 L 242 177 L 235 177 Z",
    labelX: 238, labelY: 172,
  },
  // Chandigarh
  {
    name: "Chandigarh",
    path: "M 228 140 A 4 4 0 1 1 236 140 A 4 4 0 1 1 228 140 Z",
    labelX: 232, labelY: 140,
  },
  // Rajasthan
  {
    name: "Rajasthan",
    path: "M 130 170 L 160 155 L 190 150 L 210 155 L 225 168 L 230 185 L 235 210 L 228 240 L 215 265 L 195 275 L 170 270 L 145 255 L 125 235 L 115 210 L 120 190 Z",
    labelX: 175, labelY: 215,
  },
  // Uttar Pradesh
  {
    name: "Uttar Pradesh",
    path: "M 248 160 L 270 145 L 295 145 L 320 155 L 345 165 L 360 180 L 365 200 L 355 218 L 340 228 L 320 235 L 300 240 L 280 238 L 260 228 L 245 215 L 238 195 L 240 178 Z",
    labelX: 300, labelY: 195,
  },
  // Bihar
  {
    name: "Bihar",
    path: "M 365 200 L 385 195 L 405 200 L 420 210 L 425 225 L 415 240 L 398 245 L 380 242 L 365 235 L 355 220 Z",
    labelX: 392, labelY: 222,
  },
  // Sikkim
  {
    name: "Sikkim",
    path: "M 420 185 L 430 180 L 438 185 L 438 195 L 430 200 L 420 195 Z",
    labelX: 429, labelY: 190,
  },
  // Arunachal Pradesh
  {
    name: "Arunachal Pradesh",
    path: "M 460 165 L 480 158 L 505 155 L 530 160 L 545 170 L 540 185 L 525 192 L 505 195 L 485 190 L 468 182 L 458 175 Z",
    labelX: 500, labelY: 175,
  },
  // Nagaland
  {
    name: "Nagaland",
    path: "M 520 195 L 538 190 L 548 200 L 545 215 L 532 220 L 518 212 Z",
    labelX: 533, labelY: 205,
  },
  // Manipur
  {
    name: "Manipur",
    path: "M 518 220 L 532 222 L 542 232 L 538 248 L 525 252 L 512 245 L 512 230 Z",
    labelX: 527, labelY: 237,
  },
  // Mizoram
  {
    name: "Mizoram",
    path: "M 510 255 L 522 253 L 530 262 L 528 280 L 518 290 L 508 282 L 505 268 Z",
    labelX: 518, labelY: 272,
  },
  // Tripura
  {
    name: "Tripura",
    path: "M 490 260 L 502 255 L 510 265 L 508 280 L 498 285 L 488 275 Z",
    labelX: 500, labelY: 270,
  },
  // Meghalaya
  {
    name: "Meghalaya",
    path: "M 458 215 L 478 210 L 498 212 L 512 220 L 508 232 L 492 235 L 472 232 L 456 225 Z",
    labelX: 483, labelY: 222,
  },
  // Assam
  {
    name: "Assam",
    path: "M 430 195 L 455 190 L 460 175 L 468 182 L 485 192 L 505 195 L 520 198 L 518 212 L 512 225 L 498 235 L 492 240 L 502 252 L 490 258 L 478 250 L 462 245 L 448 238 L 438 225 L 432 210 Z",
    labelX: 465, labelY: 208,
  },
  // West Bengal
  {
    name: "West Bengal",
    path: "M 398 245 L 415 242 L 430 248 L 440 240 L 455 245 L 460 260 L 458 280 L 450 300 L 440 320 L 430 340 L 425 350 L 418 340 L 412 320 L 408 300 L 400 285 L 395 265 Z",
    labelX: 430, labelY: 295,
  },
  // Jharkhand
  {
    name: "Jharkhand",
    path: "M 365 238 L 380 244 L 398 248 L 395 265 L 400 285 L 390 295 L 375 290 L 360 280 L 350 265 L 352 250 Z",
    labelX: 375, labelY: 268,
  },
  // Odisha
  {
    name: "Odisha",
    path: "M 350 280 L 370 290 L 390 298 L 405 305 L 415 320 L 420 340 L 410 355 L 395 365 L 375 368 L 355 360 L 340 345 L 332 325 L 335 305 L 342 290 Z",
    labelX: 375, labelY: 330,
  },
  // Chhattisgarh
  {
    name: "Chhattisgarh",
    path: "M 310 265 L 330 260 L 350 265 L 355 280 L 350 295 L 342 310 L 335 330 L 320 340 L 305 335 L 292 320 L 288 300 L 295 280 Z",
    labelX: 320, labelY: 300,
  },
  // Madhya Pradesh
  {
    name: "Madhya Pradesh",
    path: "M 215 240 L 240 235 L 265 238 L 290 245 L 315 255 L 330 260 L 320 278 L 305 295 L 290 308 L 270 310 L 248 305 L 228 295 L 215 280 L 205 260 Z",
    labelX: 268, labelY: 275,
  },
  // Gujarat
  {
    name: "Gujarat",
    path: "M 90 250 L 115 240 L 135 250 L 155 260 L 175 268 L 195 278 L 205 295 L 198 315 L 185 330 L 168 340 L 150 345 L 130 340 L 110 325 L 95 310 L 80 295 L 75 275 Z",
    labelX: 140, labelY: 295,
  },
  // Dadra & Nagar Haveli and Daman & Diu
  {
    name: "Dadra & Nagar Haveli and Daman & Diu",
    path: "M 145 342 A 6 6 0 1 1 157 342 A 6 6 0 1 1 145 342 Z",
    labelX: 151, labelY: 342,
  },
  // Maharashtra
  {
    name: "Maharashtra",
    path: "M 150 345 L 170 340 L 192 332 L 210 320 L 230 305 L 252 310 L 275 318 L 295 325 L 310 340 L 318 358 L 310 375 L 295 390 L 275 400 L 255 405 L 235 400 L 210 395 L 190 385 L 170 375 L 155 360 Z",
    labelX: 235, labelY: 365,
  },
  // Telangana
  {
    name: "Telangana",
    path: "M 275 365 L 295 360 L 315 362 L 330 370 L 340 385 L 335 400 L 320 410 L 300 412 L 282 405 L 270 392 L 268 378 Z",
    labelX: 305, labelY: 388,
  },
  // Andhra Pradesh
  {
    name: "Andhra Pradesh",
    path: "M 255 405 L 275 400 L 295 395 L 310 398 L 325 408 L 340 400 L 355 395 L 370 400 L 380 415 L 375 435 L 360 450 L 340 458 L 320 462 L 300 458 L 280 450 L 262 440 L 250 425 Z",
    labelX: 315, labelY: 432,
  },
  // Karnataka
  {
    name: "Karnataka",
    path: "M 175 390 L 198 395 L 220 400 L 245 405 L 255 418 L 260 440 L 252 460 L 238 475 L 220 482 L 200 480 L 182 472 L 168 458 L 158 440 L 155 420 L 160 400 Z",
    labelX: 210, labelY: 440,
  },
  // Goa
  {
    name: "Goa",
    path: "M 155 400 L 165 395 L 172 402 L 170 415 L 160 418 L 152 410 Z",
    labelX: 162, labelY: 407,
  },
  // Kerala
  {
    name: "Kerala",
    path: "M 195 482 L 210 478 L 222 485 L 228 500 L 225 520 L 218 540 L 210 555 L 200 565 L 192 555 L 188 535 L 185 515 L 188 498 Z",
    labelX: 208, labelY: 525,
  },
  // Tamil Nadu
  {
    name: "Tamil Nadu",
    path: "M 225 475 L 245 468 L 265 460 L 285 455 L 305 460 L 320 468 L 330 482 L 325 500 L 315 518 L 300 535 L 280 548 L 260 555 L 242 552 L 228 540 L 220 520 L 218 500 L 220 485 Z",
    labelX: 275, labelY: 510,
  },
  // Puducherry
  {
    name: "Puducherry",
    path: "M 292 490 A 5 5 0 1 1 302 490 A 5 5 0 1 1 292 490 Z",
    labelX: 297, labelY: 490,
  },
  // Andaman & Nicobar Islands
  {
    name: "Andaman & Nicobar Islands",
    path: "M 520 380 L 525 375 L 530 380 L 530 395 L 528 410 L 525 425 L 522 440 L 518 455 L 515 465 L 510 460 L 512 445 L 515 430 L 517 415 L 518 400 L 518 390 Z",
    labelX: 522, labelY: 420,
  },
  // Lakshadweep
  {
    name: "Lakshadweep",
    path: "M 130 490 A 6 6 0 1 1 142 490 A 6 6 0 1 1 130 490 Z",
    labelX: 136, labelY: 490,
  },
];

export default indiaMapPaths;
