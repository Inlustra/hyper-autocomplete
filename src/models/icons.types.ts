interface Icon {
  light?: string;
  dark: string;
}

interface IconComponent
  extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}
