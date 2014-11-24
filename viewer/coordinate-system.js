export default function(width, height) {
  let toScreenX = x => x * width / 26 + 140
  let toScreenY = y => y * height / 17 + 50
  let toScreen = xy => [toScreenX(xy[0]), toScreenY(xy[1])]
  
  return { toScreen }
}
