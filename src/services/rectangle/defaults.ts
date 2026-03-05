import type { PackingConfiguration, SheetDefinition } from "./rectangle.types"

export const defaultSheet: SheetDefinition = {
  width: 2500,
  height: 1250,
}

export const defaultPackingConfiguration: PackingConfiguration = {
  kerf: 2.2,
  allowRotation: true,
}
