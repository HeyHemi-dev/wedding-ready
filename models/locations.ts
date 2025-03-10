import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { locations } from '@/db/schema'

export type Location = InferSelectModel<typeof locations>
export type InsertLocation = InferInsertModel<typeof locations>

export enum Region {
  NORTHLAND = 'northland',
  AUCKLAND = 'auckland',
  WAIKATO = 'waikato',
  BAY_OF_PLENTY = 'bay_of_plenty',
  GISBORNE = 'gisborne',
  HAWKES_BAY = 'hawkes_bay',
  TARANAKI = 'taranakai',
  MANAWATU_WHANGANUI = 'manawatu_whanganui',
  WELLINGTON = 'wellington',
  NELSON_TASMAN = 'nelson_tasman',
  MARLBOROUGH = 'marlborough',
  WEST_COAST = 'west_coast',
  CANTERBURY = 'canterbury',
  OTAGO = 'otago',
  SOUTHLAND = 'southland',
}
