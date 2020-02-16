declare module '*.svg' {
    const def: string;
    export const ReactComponent: React.StatelessComponent<React.SVGAttributes<SVGElement>>;
    export default def;
}