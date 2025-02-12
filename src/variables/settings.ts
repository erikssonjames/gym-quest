const COLOR_THEMES_ARRAY = ['zinc' , 'slate' , 'stone' , 'gray' , 'neutral' , 'red' , 'rose' , 'orange' , 'green' , 'blue' , 'yellow' , 'violet'] as const;
type COLOR_THEMES = typeof COLOR_THEMES_ARRAY[number]
const STANDARD_COLOR_THEME = "violet"

const BORDER_RADIUS_ARRAY = ['zero_radius', 'small_radius', 'medium_radius', 'large_radius', 'xl_radius'] as const;
type BORDER_RADIUS = typeof BORDER_RADIUS_ARRAY[number]
const STANDARD_BORDER_RADIUS = 'medium_radius'

export {
  type COLOR_THEMES,
  COLOR_THEMES_ARRAY,
  STANDARD_COLOR_THEME,

  BORDER_RADIUS_ARRAY,
  type BORDER_RADIUS,
  STANDARD_BORDER_RADIUS
}