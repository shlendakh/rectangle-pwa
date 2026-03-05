import type { PackingConfiguration, RectangleRequest, SheetDefinition } from "./types"

export const mockupRectangles: RectangleRequest[] = [
  // {
  //   name: "Rectangle 1",
  //   width: 1000,
  //   height: 500,
  //   quantity: 5,
  // },
  {
    name: "Rectangle 2",
    width: 300,
    height: 623,
    quantity: 12,
  },
  // {
  //   name: "Rectangle 3",
  //   width: 600,
  //   height: 300,
  //   quantity: 20,
  // },
  // {
  //   name: "Rectangle 4",
  //   width: 400,
  //   height: 200,
  //   quantity: 10,
  // },
  // {
  //   name: "Rectangle Too Big",
  //   width: 2100,
  //   height: 1000,
  //   quantity: 1,
  // },
]

export const mockupSheet: SheetDefinition = {
  width: 2500,
  height: 1250,
}

export const mockupConfiguration: PackingConfiguration = {
  kerf: 2.2,
  allowRotation: true,
}
