type DirEntry = Window['xvser']['list'] extends (dirPath: string) => Promise<Array<infer T>> ? T : never

export type ViewLayout = 'details' | 'tiles' | 'grid' | 'list' | 'content'
export type IconSize = 'small' | 'medium' | 'large' | 'extra-large'

export interface ViewOptions {
  layout: ViewLayout
  iconSize: IconSize
  showItemCheckboxes: boolean
}

export type { DirEntry }